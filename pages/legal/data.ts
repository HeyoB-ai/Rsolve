// Concept juridische teksten voor Rsolve (Clareco bv). Gebaseerd op hoe de applicatie
// aantoonbaar werkt. LAAT DIT VÓÓR DEFINITIEF GEBRUIK CONTROLEREN DOOR EEN JURIST/DPO
// en vul de plekhouders (zoals [KvK-nummer]) in.

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDoc {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const COMPANY = 'Clareco bv';
const ADDRESS = 'Baronielaan 107 A, 4818 PD Breda';
const EMAIL = 'clareco.online@gmail.com';
const UPDATED = '18 augustus 2026';

export const LEGAL: Record<string, LegalDoc> = {
  '/privacy': {
    slug: '/privacy',
    seoTitle: 'Privacybeleid & AVG-verklaring',
    metaDescription:
      'Hoe Rsolve (Clareco bv) omgaat met jouw persoonsgegevens: welke gegevens we verwerken, waarvoor, hoe lang, met wie we ze delen en welke rechten je hebt onder de AVG.',
    title: 'Privacybeleid',
    updated: UPDATED,
    intro:
      `Rsolve is een dienst van ${COMPANY}. Wij vinden jouw privacy belangrijk, zeker omdat je bij een conflict gevoelige informatie deelt. In dit privacybeleid leggen we uit welke persoonsgegevens we verwerken, met welk doel, op welke grondslag, hoe lang we ze bewaren, met wie we ze delen en welke rechten je hebt. Dit beleid is opgesteld conform de Algemene Verordening Gegevensbescherming (AVG).`,
    sections: [
      {
        heading: '1. Wie is verantwoordelijk?',
        paragraphs: [
          `De verwerkingsverantwoordelijke voor jouw gegevens is ${COMPANY}, gevestigd aan ${ADDRESS} (KvK-nummer: [KvK-nummer invullen]). Voor vragen over dit privacybeleid of over jouw gegevens kun je contact met ons opnemen via ${EMAIL}.`,
        ],
      },
      {
        heading: '2. Welke gegevens verwerken we?',
        paragraphs: [
          'Rsolve werkt zonder verplicht account. We verwerken alleen de gegevens die nodig zijn om de bemiddeling uit te voeren en die je zelf invoert of die technisch noodzakelijk zijn:',
        ],
        bullets: [
          'De omschrijving van het conflict en de berichten die je in de bemiddeling typt.',
          'De namen die partijen gebruiken en, als je daarvoor kiest, contactgegevens zoals e-mailadres en telefoonnummer (bijvoorbeeld bij het aanvragen van juridische hulp).',
          'Eventuele bijlagen (zoals foto’s of documenten) die je aan een dossier toevoegt.',
          'De digitale ondertekening van een vaststellingsovereenkomst.',
          'Betaalgegevens bij de eenmalige betaling van € 3,99; deze worden verwerkt door onze betaaldienst (Stripe). Wij ontvangen zelf geen volledige kaart- of rekeninggegevens.',
          'Beperkte technische gegevens die nodig zijn om de dienst te laten werken en te beveiligen (zoals een dossier-identificatie en, tijdelijk, gegevens voor misbruikpreventie/rate limiting).',
        ],
      },
      {
        heading: '3. Waarvoor en op welke grondslag?',
        paragraphs: [
          'We verwerken je gegevens uitsluitend voor de volgende doeleinden:',
        ],
        bullets: [
          'Het uitvoeren van de bemiddeling en het opstellen van een vaststellingsovereenkomst (grondslag: uitvoering van de overeenkomst, art. 6 lid 1 sub b AVG).',
          'Het afhandelen van de betaling (grondslag: uitvoering van de overeenkomst).',
          'Het op jouw verzoek doorverwijzen naar een advocaat, mediator of Het Juridisch Loket, waarbij eerst alleen een geanonimiseerde samenvatting wordt gedeeld (grondslag: jouw toestemming).',
          'Het beveiligen en verbeteren van de dienst en het voorkomen van misbruik (grondslag: gerechtvaardigd belang).',
        ],
      },
      {
        heading: '4. Verwerking door AI',
        paragraphs: [
          'De bemiddeling en vertaling worden ondersteund door AI-taalmodellen (Google Gemini), die uitsluitend server-side worden aangeroepen. Jouw dossier wordt gebruikt om de bemiddeling uit te voeren en wordt niet gebruikt om publieke AI-modellen te trainen.',
        ],
      },
      {
        heading: '5. Met wie delen we gegevens (verwerkers)?',
        paragraphs: [
          'Wij verkopen je gegevens nooit. We schakelen wel dienstverleners in die namens ons gegevens verwerken, op basis van verwerkersovereenkomsten:',
        ],
        bullets: [
          'Supabase — database- en opslagdienst; jouw dossiergegevens worden binnen de EU opgeslagen.',
          'Google (Gemini API) — voor de AI-bemiddeling en -vertaling.',
          'Stripe — voor de afhandeling van de betaling.',
          'Netlify — voor het hosten van de website en het verwerken van formulierinzendingen.',
        ],
      },
      {
        heading: '6. Doorgifte buiten de EU',
        paragraphs: [
          'Wij streven naar verwerking en opslag binnen de Europese Unie. Voor zover een dienstverlener gegevens buiten de EU verwerkt, gebeurt dit uitsluitend met passende waarborgen zoals de door de Europese Commissie vastgestelde standaardcontractbepalingen (SCC’s). Een actueel overzicht kun je bij ons opvragen.',
        ],
      },
      {
        heading: '7. Bewaartermijn en verwijdering',
        paragraphs: [
          'We bewaren je gegevens niet langer dan nodig. Na afronding en download van de getekende overeenkomst kun je het volledige dossier met één handeling permanent laten verwijderen van onze servers. Gegevens die we wettelijk moeten bewaren (zoals betaalgegevens voor de fiscale administratie) bewaren we gedurende de wettelijke termijn.',
        ],
      },
      {
        heading: '8. Beveiliging',
        paragraphs: [
          'We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen. Gegevens worden versleuteld verzonden (TLS) en opgeslagen, de opslag is afgeschermd en gevoelige toegangssleutels zijn niet vanuit de browser benaderbaar.',
        ],
      },
      {
        heading: '9. Jouw rechten',
        paragraphs: [
          'Je hebt op grond van de AVG het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen, om bezwaar te maken tegen verwerking, om verwerking te laten beperken en om je gegevens over te laten dragen. Ook kun je een gegeven toestemming altijd intrekken.',
          `Wil je een van deze rechten uitoefenen? Neem contact op via ${EMAIL}. Ben je het niet eens met hoe wij met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.`,
        ],
      },
      {
        heading: '10. Cookies en lokale opslag',
        paragraphs: [
          'Rsolve gebruikt geen tracking- of advertentiecookies. Voor het functioneren van de app slaan we beperkte gegevens lokaal in je browser op (zoals je taalkeuze en de status van je actieve dossier). Deze gegevens blijven op je eigen apparaat en worden niet voor tracking gebruikt.',
        ],
      },
      {
        heading: '11. Wijzigingen',
        paragraphs: [
          'We kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest actuele versie staat altijd op deze pagina, met bovenaan de datum van de laatste wijziging.',
        ],
      },
      {
        heading: '12. Contact',
        paragraphs: [
          `${COMPANY}, ${ADDRESS}. Vragen over privacy? Mail ons via ${EMAIL}.`,
        ],
      },
    ],
  },

  '/terms': {
    slug: '/terms',
    seoTitle: 'Gebruiksvoorwaarden',
    metaDescription:
      'De gebruiksvoorwaarden van Rsolve (Clareco bv): wat de dienst inhoudt, het tarief, de vaststellingsovereenkomst, aansprakelijkheid en toepasselijk recht. Rsolve biedt bemiddeling, geen juridisch advies.',
    title: 'Gebruiksvoorwaarden',
    updated: UPDATED,
    intro:
      `Deze gebruiksvoorwaarden zijn van toepassing op het gebruik van Rsolve, een dienst van ${COMPANY}. Door Rsolve te gebruiken ga je met deze voorwaarden akkoord. Lees ze daarom goed door.`,
    sections: [
      {
        heading: '1. Wat is Rsolve?',
        paragraphs: [
          'Rsolve is een online platform dat twee partijen met behulp van een neutrale AI-mediator begeleidt om samen tot afspraken te komen. Rsolve is een hulpmiddel bij bemiddeling en biedt uitdrukkelijk géén juridisch advies en geen juridische toetsing. Rsolve is geen advocaat, mediator in de zin van een wettelijk gereguleerd beroep, of vervanger van een gang naar de rechter.',
        ],
      },
      {
        heading: '2. Toegang en deelname',
        paragraphs: [
          'Deelname aan Rsolve is vrijwillig voor beide partijen. Je nodigt de andere partij uit via een beveiligde link; deelname kan niet worden afgedwongen. Voor de uitgenodigde partij is deelname kosteloos. Je bent zelf verantwoordelijk voor het vertrouwelijk houden van de uitnodigingslink.',
        ],
      },
      {
        heading: '3. Tarief en betaling',
        paragraphs: [
          'Het gebruik van Rsolve kost eenmalig € 3,99 per dossier voor de partij die het dossier start. Er is geen abonnement en er zijn geen verborgen kosten. De betaling wordt afgehandeld via onze betaaldienst. Omdat de dienst direct beschikbaar wordt gesteld, kan het herroepingsrecht vervallen zodra je met de uitvoering start; eventuele restitutie beoordelen we redelijk en per geval.',
        ],
      },
      {
        heading: '4. De vaststellingsovereenkomst',
        paragraphs: [
          'Als beide partijen akkoord gaan, legt Rsolve de door partijen zelf gemaakte afspraken vast in een vaststellingsovereenkomst (art. 7:900 BW). Dit document legt uitsluitend jullie eigen afspraken vast en vormt geen juridisch advies of juridische toetsing. Bij twijfel over de inhoud of de gevolgen raden we aan de overeenkomst te laten controleren door een jurist of advocaat.',
        ],
      },
      {
        heading: '5. Jouw verplichtingen',
        paragraphs: [
          'Je verstrekt juiste en volledige informatie en gebruikt Rsolve niet voor onrechtmatige doeleinden. Het is niet toegestaan de dienst te misbruiken, te overbelasten, te proberen te omzeilen of te gebruiken op een manier die de rechten van anderen schaadt.',
        ],
      },
      {
        heading: '6. Geen garantie op uitkomst',
        paragraphs: [
          'Rsolve spant zich in om het gesprek constructief te begeleiden, maar kan niet garanderen dat partijen tot overeenstemming komen of dat een bepaalde uitkomst wordt bereikt. Het resultaat is afhankelijk van de inbreng en bereidheid van beide partijen.',
        ],
      },
      {
        heading: '7. Aansprakelijkheid',
        paragraphs: [
          `${COMPANY} is niet aansprakelijk voor schade die voortvloeit uit het gebruik van Rsolve, uit de inhoud van de door partijen gemaakte afspraken, of uit beslissingen die je op basis van de bemiddeling neemt, behoudens opzet of bewuste roekeloosheid. Voor zover aansprakelijkheid toch bestaat, is deze beperkt tot het voor het betreffende dossier betaalde bedrag. Rsolve geeft geen juridisch advies; raadpleeg voor je rechtspositie een gekwalificeerde professional.`,
        ],
      },
      {
        heading: '8. Intellectueel eigendom',
        paragraphs: [
          `Alle rechten op de website, het platform, de vormgeving en de onderliggende techniek berusten bij ${COMPANY} of haar licentiegevers. De inhoud van jouw dossier en de door jullie gemaakte afspraken blijven van de betrokken partijen.`,
        ],
      },
      {
        heading: '9. Beschikbaarheid',
        paragraphs: [
          'We streven naar een goede beschikbaarheid van de dienst, maar kunnen niet garanderen dat Rsolve altijd ononderbroken of foutloos beschikbaar is. We kunnen de dienst tijdelijk opschorten voor onderhoud of om zwaarwegende redenen.',
        ],
      },
      {
        heading: '10. Toepasselijk recht en geschillen',
        paragraphs: [
          'Op deze voorwaarden en op het gebruik van Rsolve is Nederlands recht van toepassing. Geschillen leggen we voor aan de bevoegde rechter in Nederland, tenzij dwingend recht anders bepaalt.',
        ],
      },
      {
        heading: '11. Wijzigingen',
        paragraphs: [
          'We kunnen deze voorwaarden aanpassen. De actuele versie staat altijd op deze pagina, met bovenaan de datum van de laatste wijziging.',
        ],
      },
      {
        heading: '12. Contact',
        paragraphs: [
          `${COMPANY}, ${ADDRESS}. Vragen over deze voorwaarden? Mail ons via ${EMAIL}.`,
        ],
      },
    ],
  },
};
