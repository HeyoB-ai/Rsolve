-- ============================================================
-- Rsolve — Rate limiting (gedeelde teller voor serverless-functies)
-- Project xdtoviyfarvbybthhqaq → Supabase SQL Editor.
-- Veilig om VOOR of NA de code-deploy te draaien: de functies gebruiken
-- fail-open, dus zonder deze tabel/functie werken ze gewoon (zonder limiet).
-- ============================================================

-- Teller per sleutel (bv. "export:<ip>") per vast tijdvenster.
create table if not exists public.rate_limits (
  key          text        not null,
  window_start timestamptz not null,
  count        integer     not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
-- Bewust GEEN policies: alleen de service-role (server-functies) mag hierbij.

-- Atomisch: verhoog de teller voor het huidige venster en geef terug of we
-- nog binnen de limiet zitten (true = toegestaan, false = geblokkeerd).
create or replace function public.rl_check(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  bucket timestamptz;
  cur    int;
begin
  bucket := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limits (key, window_start, count)
    values (p_key, bucket, 1)
    on conflict (key, window_start)
    do update set count = rate_limits.count + 1
    returning count into cur;

  -- Opportunistische opschoning van oude vensters (ca. 2% van de aanroepen).
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 hours';
  end if;

  return cur <= p_max;
end;
$$;

-- Alleen de server-functies (service-role) mogen de teller ophogen/checken.
revoke all on function public.rl_check(text, int, int) from public, anon, authenticated;
grant execute on function public.rl_check(text, int, int) to service_role;

notify pgrst, 'reload schema';
