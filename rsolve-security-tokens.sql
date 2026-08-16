-- ============================================================
-- Rsolve — Beveiliging: partij-tokens afschermen van de publieke sleutel
-- Project xdtoviyfarvbybthhqaq → Supabase SQL Editor.
--
-- BELANGRIJK: draai dit pas NADAT de code met expliciete kolom-selects
-- (JoinCase.tsx, VSO.tsx) is gedeployed. Anders breekt een live 'select(*)'.
-- ============================================================

-- ── Diagnose vooraf (optioneel): laat zien of de anon-sleutel de tokens ziet.
--    Verwacht vóór de fix: tokenwaarden. Ná de fix: 'permission denied'.
-- set role anon;
-- select id, initiator_token, respondent_token from public.cases limit 3;
-- reset role;

-- 1) REST: anon/authenticated mag ALLE kolommen van cases lezen BEHALVE de tokens.
--    Dynamisch opgebouwd, zodat er nooit een kolom wordt vergeten.
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ')
    into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'cases'
    and column_name not in ('initiator_token', 'respondent_token');

  execute 'revoke select on public.cases from anon, authenticated';
  execute 'grant select (' || cols || ') on public.cases to anon, authenticated';
end $$;

-- 2) Realtime: sluit de token-kolommen uit van de publicatie, zodat ze ook niet
--    via realtime-updates meelekken (publicatie-kolomlijst, PostgreSQL 15+).
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ')
    into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'cases'
    and column_name not in ('initiator_token', 'respondent_token');

  execute 'alter publication supabase_realtime set table public.cases (' || cols || ')';
exception when others then
  raise notice 'Realtime-publicatie niet aangepast (mogelijk andere setup): %', SQLERRM;
end $$;

-- 3) Write-bescherming: een reeds gezet token mag niet worden overschreven.
create or replace function public.protect_case_tokens()
returns trigger as $$
begin
  if OLD.initiator_token is not null
     and NEW.initiator_token is distinct from OLD.initiator_token then
    NEW.initiator_token := OLD.initiator_token;
  end if;
  if OLD.respondent_token is not null
     and NEW.respondent_token is distinct from OLD.respondent_token then
    NEW.respondent_token := OLD.respondent_token;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_protect_case_tokens on public.cases;
create trigger trg_protect_case_tokens
  before update on public.cases
  for each row execute function public.protect_case_tokens();

-- 4) Schema-cache herladen.
notify pgrst, 'reload schema';

-- ── Controle achteraf: dit hoort nu te FALEN met 'permission denied'.
-- set role anon;
-- select initiator_token from public.cases limit 1;
-- reset role;
