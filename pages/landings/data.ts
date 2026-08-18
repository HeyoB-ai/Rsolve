// Inhoudsmodel voor de SEO-landingspagina's. Elke pagina geeft echt antwoord op een
// concrete situatie (probleem → hoe Rsolve helpt → proces → kosten → privacy →
// beperkingen van AI → FAQ → CTA) en herhaalt niet louter dezelfde verkooptekst.
// Bewust voorzichtig geformuleerd: Rsolve faciliteert, geeft geen juridisch advies.

export interface LandingFAQ {
  q: string;
  a: string;
}

export interface LandingSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface LandingContent {
  slug: string; // bijv. '/arbeidsconflict-oplossen'
  seoTitle: string; // <title> zonder ' | Rsolve' (RouteSeo voegt merk toe)
  metaDescription: string;
  kicker: string;
  h1: string;
  intro: string;
  problem: LandingSection;
  help: LandingSection;
  costs: LandingSection;
  privacy: LandingSection;
  limits: LandingSection;
  faq: LandingFAQ[];
  cta: { heading: string; body: string; button: string };
  related: { label: string; to: string }[];
}

// Het bemiddelingsproces is voor elk conflict gelijk; we tonen het overal, met een
// pagina-specifieke inleiding erboven.
export const PROCESS_STEPS: { title: string; body: string }[] = [
  {
    title: 'Nodig de andere partij uit',
    body: 'Je start een dossier en deelt een beveiligde link. De ander doet gratis mee — geen account of installatie nodig.',
  },
  {
    title: 'Ieder vertelt zijn kant',
    body: 'Beiden typen in eigen woorden en eigen tempo wat er speelt. De AI-mediator haalt de emotionele lading eruit en vertaalt verwijten naar belangen.',
  },
  {
    title: 'Samen naar een voorstel',
    body: 'De mediator legt neutrale, concrete voorstellen voor waar beide partijen op kunnen reageren, tot er een afspraak ligt waar jullie je in kunnen vinden.',
  },
  {
    title: 'Afspraken vastgelegd',
    body: 'Zijn jullie het eens, dan zet Rsolve de gemaakte afspraken op papier in een vaststellingsovereenkomst (art. 7:900 BW) die je allebei ondertekent.',
  },
];

const SHARED_COSTS: LandingSection = {
  heading: 'Wat kost het?',
  body:
    'Rsolve werkt met één vast tarief van € 3,99 per dossier. Geen abonnement, geen uurtarief, geen verborgen kosten. Voor de uitgenodigde partij is deelname gratis. Ter vergelijking: een traditioneel mediationtraject kost al snel € 1.200 – € 2.400 en een advocaat- of rechtszaaktraject vaak € 2.500 – € 7.500 of meer.',
};

const SHARED_PRIVACY: LandingSection = {
  heading: 'Privacy en vertrouwelijkheid',
  body:
    'Alles wat je deelt blijft vertrouwelijk. Gesprekken worden versleuteld verzonden en opgeslagen binnen de EU, en jullie dossier wordt nooit gebruikt om publieke AI-modellen te trainen. Na afronding kun je het volledige dossier met één klik verwijderen. Rsolve werkt conform de AVG.',
};

export const LANDINGS: Record<string, LandingContent> = {
  '/arbeidsconflict-oplossen': {
    slug: '/arbeidsconflict-oplossen',
    seoTitle: 'Arbeidsconflict oplossen zonder advocaat',
    metaDescription:
      'Een arbeidsconflict op het werk oplossen zonder dure procedure? Rsolve begeleidt beide partijen met een neutrale AI-mediator naar concrete afspraken. Vast tarief € 3,99.',
    kicker: 'Arbeidsconflict',
    h1: 'Een arbeidsconflict oplossen — kalm, neutraal en zonder advocaat',
    intro:
      'Een conflict op het werk kost energie, slaap en werkplezier, en loopt makkelijk verder op naarmate het langer duurt. Of het nu gaat om een meningsverschil met een collega, spanning met je leidinggevende of een geschil rond taken en afspraken: vaak zit de kern in miscommunicatie en botsende belangen, niet in onwil. Rsolve helpt jullie het gesprek weer op gang te brengen en om te zetten in werkbare afspraken.',
    problem: {
      heading: 'Herken je dit?',
      body:
        'Arbeidsconflicten beginnen zelden groot. Ze groeien uit kleine irritaties die niet worden uitgesproken, tot samenwerken bijna onmogelijk voelt.',
      bullets: [
        'De communicatie verloopt stroef of alleen nog via de mail.',
        'Je voelt je niet gehoord, of merkt dat de ander dat vindt.',
        'Onduidelijke afspraken over taken, rollen of verwachtingen.',
        'De sfeer op de afdeling lijdt eronder en je ziet op tegen elke werkdag.',
      ],
    },
    help: {
      heading: 'Hoe Rsolve helpt bij een arbeidsconflict',
      body:
        'Rsolve is een neutrale AI-mediator die geen partij kiest. Beide betrokkenen leggen hun kant uit; de mediator filtert de emotie eruit en brengt de werkelijke belangen in beeld — bijvoorbeeld duidelijkheid, waardering of een werkbare taakverdeling. Vervolgens helpt Rsolve om daar concrete, wederzijds acceptabele afspraken van te maken.',
      bullets: [
        'Asynchroon: je hoeft niet tegelijk online te zijn of fysiek af te spreken.',
        'Neutraal en zonder oordeel — de mediator staat aan niemands kant.',
        'Gericht op herstel van de werkrelatie, niet op winnen of verliezen.',
      ],
    },
    costs: SHARED_COSTS,
    privacy: SHARED_PRIVACY,
    limits: {
      heading: 'Wat Rsolve wél en niet doet',
      body:
        'Rsolve begeleidt het gesprek en helpt je eigen afspraken vast te leggen. Het is geen advocaat en geeft geen juridisch advies of oordeel over je rechtspositie.',
      bullets: [
        'Bij ontslag, een vaststellingsovereenkomst met je werkgever of een zieke werknemer is juridische toetsing verstandig — laat de afspraken bij twijfel controleren door een jurist of arbeidsrecht­advocaat.',
        'Bij vermoedens van discriminatie, intimidatie of een onveilige situatie is bemiddeling niet het juiste kanaal; schakel dan een vertrouwenspersoon, bedrijfsarts of de daartoe bevoegde instantie in.',
        'Rsolve vervangt geen bedrijfsarts, arbodienst of gang naar de rechter.',
      ],
    },
    faq: [
      {
        q: 'Kan ik Rsolve gebruiken voor een conflict met een collega?',
        a: 'Ja. Juist bij een conflict tussen collega’s werkt de neutrale, asynchrone aanpak goed: beiden vertellen rustig hun kant zonder dat het gesprek escaleert, en de mediator helpt naar werkbare afspraken.',
      },
      {
        q: 'Is een afspraak via Rsolve rechtsgeldig?',
        a: 'Als beide partijen akkoord gaan, legt Rsolve de afspraken vast in een vaststellingsovereenkomst (art. 7:900 BW). Die legt jullie eigen afspraken vast; het is geen juridisch oordeel. Bij twijfel raden we aan het document te laten controleren door een jurist.',
      },
      {
        q: 'Moet mijn werkgever hieraan meedoen?',
        a: 'Deelname is vrijwillig. Je nodigt de ander uit met een link; meedoen kan niet worden afgedwongen. Wel weegt een aantoonbare poging tot bemiddeling vaak in je voordeel als de zaak later toch bij een instantie of rechter komt.',
      },
      {
        q: 'Wat als we er niet uitkomen?',
        a: 'Dan houd je een gedocumenteerd dossier van de poging. Rsolve kan je via ons netwerk doorverwijzen naar een mediator of arbeidsrechtadvocaat, of naar Het Juridisch Loket als je inkomen laag is.',
      },
    ],
    cta: {
      heading: 'Klaar om het gesprek weer op gang te brengen?',
      body: 'Start een neutraal dossier en nodig de ander uit. Binnen 10 minuten kun je op weg zijn naar concrete afspraken.',
      button: 'Start bemiddeling (€3,99)',
    },
    related: [
      { label: 'Conflict met je werkgever', to: '/conflict-met-werkgever' },
      { label: 'Voor bedrijven', to: '/zakelijk' },
      { label: 'Juridische hulp nodig?', to: '/juridische-hulp' },
    ],
  },

  '/conflict-met-werkgever': {
    slug: '/conflict-met-werkgever',
    seoTitle: 'Conflict met je werkgever oplossen',
    metaDescription:
      'Een conflict met je werkgever aanpakken zonder meteen te procederen? Rsolve begeleidt jou en je werkgever neutraal naar duidelijke afspraken. Vast tarief € 3,99.',
    kicker: 'Conflict met werkgever',
    h1: 'Een conflict met je werkgever oplossen zonder direct te procederen',
    intro:
      'Een geschil met je werkgever voelt ongelijk: de ander bepaalt je salaris, je rooster en soms je toekomst. Toch is een gang naar de rechter zelden de snelste of prettigste route. Vaak gaat het om onduidelijkheid over afspraken, uitbetaling, functie-inhoud of de manier van communiceren. Rsolve biedt een neutrale plek om dat op tafel te leggen en samen naar een oplossing te werken — voordat het escaleert.',
    problem: {
      heading: 'Waar loopt het vaak op vast?',
      body:
        'Werknemers stappen laat naar een oplossing omdat de drempel hoog voelt. Ondertussen loopt de spanning op.',
      bullets: [
        'Onenigheid over loon, overuren, vakantiedagen of onkosten.',
        'Onduidelijkheid over je functie, taken of een aangekondigde wijziging.',
        'Het gevoel niet serieus genomen te worden, of langs elkaar heen praten.',
        'Spanning die de werkrelatie en je gezondheid onder druk zet.',
      ],
    },
    help: {
      heading: 'Hoe Rsolve helpt bij een conflict met je werkgever',
      body:
        'Rsolve geeft beide kanten evenveel ruimte. Jij en je werkgever leggen ieder de situatie uit; de neutrale AI-mediator vertaalt standpunten naar belangen en formuleert voorstellen die voor beiden werkbaar zijn. Omdat het asynchroon en schriftelijk gaat, blijft het gesprek zakelijk en verlopen emoties minder snel uit de hand.',
      bullets: [
        'Een gelijk speelveld: beide partijen krijgen evenveel ruimte.',
        'Zakelijk en schriftelijk, zodat afspraken zwart-op-wit komen te staan.',
        'Gericht op een werkbare voortzetting of een nette afronding.',
      ],
    },
    costs: SHARED_COSTS,
    privacy: SHARED_PRIVACY,
    limits: {
      heading: 'Belangrijk om te weten',
      body:
        'Rsolve is een bemiddelaar, geen advocaat, en geeft geen juridisch advies over je rechtspositie of over de hoogte van bijvoorbeeld een vergoeding.',
      bullets: [
        'Gaat het om ontslag, een vaststellingsovereenkomst bij einde dienstverband, een transitievergoeding of langdurige ziekte? Laat dit altijd juridisch toetsen door een arbeidsrechtadvocaat of jurist voordat je tekent — hier gelden termijnen en regels die je rechten kunnen raken.',
        'Bij discriminatie, een onveilige werkplek of intimidatie: schakel een vertrouwenspersoon, de arbodienst of de bevoegde instantie in.',
        'Een vaststellingsovereenkomst via Rsolve legt jullie eigen afspraken vast en is geen juridische toetsing.',
      ],
    },
    faq: [
      {
        q: 'Kan mijn werkgever weigeren mee te doen?',
        a: 'Ja, deelname is vrijwillig voor beide partijen. Je kunt je werkgever uitnodigen, maar niet dwingen. Een aantoonbare poging tot bemiddeling wordt door instanties en rechters doorgaans positief gewaardeerd.',
      },
      {
        q: 'Verlies ik rechten als ik eerst bemiddel?',
        a: 'Bemiddelen op zich kost je geen rechten, maar bij ontslag en vaststellingsovereenkomsten gelden wettelijke termijnen (zoals de bedenktermijn). Laat een definitieve overeenkomst daarom altijd door een jurist controleren voordat je tekent.',
      },
      {
        q: 'Is dit vertrouwelijk ten opzichte van mijn werkgever?',
        a: 'Het dossier is vertrouwelijk en versleuteld. Wat je met de mediator deelt, blijft binnen het dossier; alleen de gezamenlijk gemaakte afspraken komen in de overeenkomst.',
      },
      {
        q: 'Wat als we er niet uitkomen?',
        a: 'Dan heb je een gedocumenteerde poging tot oplossing, wat later in je voordeel kan werken. Rsolve kan je doorverwijzen naar een arbeidsrechtadvocaat, of naar Het Juridisch Loket als je inkomen onder de grens valt.',
      },
    ],
    cta: {
      heading: 'Zet de eerste stap naar duidelijkheid',
      body: 'Start een neutraal dossier en nodig je werkgever uit om samen tot heldere afspraken te komen.',
      button: 'Start bemiddeling (€3,99)',
    },
    related: [
      { label: 'Arbeidsconflict oplossen', to: '/arbeidsconflict-oplossen' },
      { label: 'Juridische hulp nodig?', to: '/juridische-hulp' },
      { label: 'Wat een conflict kost', to: '/kosten-conflict' },
    ],
  },

  '/burenruzie-oplossen': {
    slug: '/burenruzie-oplossen',
    seoTitle: 'Burenruzie oplossen zonder escalatie',
    metaDescription:
      'Een burenruzie oplossen over geluid, een schutting, bomen of de erfgrens? Rsolve helpt jou en je buren met een neutrale AI-mediator naar een afspraak. Vast tarief € 3,99.',
    kicker: 'Burenruzie',
    h1: 'Een burenruzie oplossen voordat het verder escaleert',
    intro:
      'Ruzie met de buren is bijzonder vervelend, want je komt elkaar elke dag tegen. Wat begint met een kleine ergernis over geluid, een schutting of een boom, kan uitgroeien tot jarenlange spanning. Naar de rechter stappen is duur en maakt het contact meestal definitief kapot. Rsolve helpt jullie het gesprek te voeren dat direct lastig is — neutraal, op afstand en gericht op een leefbare oplossing.',
    problem: {
      heading: 'Veelvoorkomende burengeschillen',
      body:
        'De meeste burenruzies gaan niet over onwil, maar over botsende behoeften: de één wil rust, de ander privacy of ruimte.',
      bullets: [
        'Geluidsoverlast — muziek, huisdieren, klussen of kinderen.',
        'Een schutting, heg of boom die te hoog is of licht wegneemt.',
        'Onenigheid over de erfgrens, overhangende takken of bladval.',
        'Parkeren, gedeelde paden, schuttingonderhoud of vocht/schade.',
      ],
    },
    help: {
      heading: 'Hoe Rsolve helpt bij een burenruzie',
      body:
        'Rsolve laat beide buren rustig hun kant vertellen zonder dat het aan de voordeur uit de hand loopt. De neutrale AI-mediator haalt de scherpte uit de woorden en zoekt naar de belangen eronder — zonlicht, rust, privacy — om vervolgens een concreet compromis voor te stellen, zoals een snoeihoogte of een gebruiksafspraak.',
      bullets: [
        'Op afstand en asynchroon — geen ongemakkelijk gesprek aan de deur.',
        'Neutraal: geen van beide buren wordt voorgetrokken.',
        'Gericht op een afspraak waar je samen jaren mee vooruit kunt.',
      ],
    },
    costs: SHARED_COSTS,
    privacy: SHARED_PRIVACY,
    limits: {
      heading: 'Wat Rsolve wél en niet doet',
      body:
        'Rsolve begeleidt het gesprek en legt jullie afspraken vast. Het geeft geen juridisch oordeel over bijvoorbeeld erfgrenzen, het burenrecht of toegestane hoogtes.',
      bullets: [
        'Vragen over wat wettelijk mag (erfgrens, maximale hoogte, verjaring) horen bij een jurist of het Kadaster — Rsolve doet daar geen bindende uitspraken over.',
        'Bij bedreiging, geweld of een acuut gevaarlijke situatie: schakel de politie in (bel 112 bij nood, 0900-8844 voor niet-spoed).',
        'Een vaststellingsovereenkomst via Rsolve legt jullie eigen afspraken vast en is geen juridische toetsing.',
      ],
    },
    faq: [
      {
        q: 'Werkt dit ook als we nauwelijks meer met elkaar praten?',
        a: 'Juist dan. Omdat alles schriftelijk en op afstand gaat, hoef je geen ongemakkelijk gesprek aan te knopen. Beiden reageren in eigen tempo, en de mediator bewaakt de toon.',
      },
      {
        q: 'Mag de haag of schutting van de buren zo hoog zijn?',
        a: 'Daar gelden regels voor (burenrecht), maar wat in jouw situatie precies mag, is een juridische vraag. Rsolve richt zich op een werkbare afspraak tussen jullie; voor de juridische grenzen verwijzen we je naar een jurist of Het Juridisch Loket.',
      },
      {
        q: 'Wat als mijn buren niet willen meedoen?',
        a: 'Deelname is vrijwillig. Je kunt uitnodigen, niet dwingen. Blijkt bemiddeling niet mogelijk, dan heb je in elk geval aantoonbaar een nette poging gedaan — dat weegt vaak mee bij een eventuele vervolgstap.',
      },
      {
        q: 'Is de afspraak bindend?',
        a: 'Als jullie akkoord zijn, legt Rsolve de afspraken vast in een vaststellingsovereenkomst (art. 7:900 BW) die je allebei tekent. Die legt jullie eigen afspraken vast; laat het bij twijfel controleren door een jurist.',
      },
    ],
    cta: {
      heading: 'Maak weer een leefbare afspraak met je buren',
      body: 'Start een neutraal dossier en nodig je buren uit. Vaak is een geschil sneller opgelost dan je denkt.',
      button: 'Start bemiddeling (€3,99)',
    },
    related: [
      { label: 'Huurconflict oplossen', to: '/huurconflict-oplossen' },
      { label: 'Wat een conflict kost', to: '/kosten-conflict' },
      { label: 'Juridische hulp nodig?', to: '/juridische-hulp' },
    ],
  },

  '/huurconflict-oplossen': {
    slug: '/huurconflict-oplossen',
    seoTitle: 'Huurconflict oplossen — huurder & verhuurder',
    metaDescription:
      'Een huurconflict over de borg, servicekosten, onderhoud of oplevering? Rsolve helpt huurder en verhuurder met een neutrale AI-mediator naar een afspraak. Vast tarief € 3,99.',
    kicker: 'Huurconflict',
    h1: 'Een huurconflict oplossen tussen huurder en verhuurder',
    intro:
      'Geschillen tussen huurder en verhuurder gaan vaak over geld en verwachtingen: de waarborgsom die niet terugkomt, servicekosten die onduidelijk zijn, achterstallig onderhoud of discussie bij de oplevering. Zulke conflicten slepen aan omdat beide partijen zich in hun gelijk vastbijten. Rsolve biedt een neutrale plek om de feiten en belangen naast elkaar te leggen en tot een redelijke afspraak te komen.',
    problem: {
      heading: 'Veelvoorkomende huurgeschillen',
      body:
        'De meeste huurconflicten ontstaan door onduidelijke afspraken en oplopende irritatie over en weer.',
      bullets: [
        'De waarborgsom wordt niet (volledig) terugbetaald na afloop.',
        'Onenigheid over servicekosten, huurverhoging of afrekening.',
        'Achterstallig onderhoud of reparaties die blijven liggen.',
        'Discussie over schade, normale slijtage of de eindoplevering.',
      ],
    },
    help: {
      heading: 'Hoe Rsolve helpt bij een huurconflict',
      body:
        'Rsolve laat huurder en verhuurder ieder hun kant en onderbouwing delen — foto’s en documenten kun je toevoegen. De neutrale AI-mediator scheidt emotie van feiten en stelt een concreet voorstel voor, bijvoorbeeld een verdeling van kosten of een termijn voor terugbetaling of herstel. Zo voorkom je een slepende procedure.',
      bullets: [
        'Voeg bewijs toe: foto’s van schade, het opnameformulier of afspraken.',
        'Neutraal en feitelijk, zodat het niet blijft hangen in welles-nietes.',
        'Snel: vaak binnen een dossier van 10 minuten een concreet voorstel.',
      ],
    },
    costs: SHARED_COSTS,
    privacy: SHARED_PRIVACY,
    limits: {
      heading: 'Wat Rsolve wél en niet doet',
      body:
        'Rsolve bemiddelt en legt jullie afspraken vast, maar geeft geen juridisch advies over huurrecht, huurprijzen of de rechtsgeldigheid van bedingen.',
      bullets: [
        'Voor bindende toetsing van huurprijs, servicekosten of een geschil kun je terecht bij de Huurcommissie of een jurist — Rsolve treedt daar niet voor in de plaats.',
        'Bij (dreigende) huisuitzetting of een lopende procedure: win eerst juridisch advies in bij een jurist of Het Juridisch Loket.',
        'Een vaststellingsovereenkomst via Rsolve legt jullie eigen afspraken vast en is geen juridische toetsing.',
      ],
    },
    faq: [
      {
        q: 'Kan ik dit gebruiken om mijn borg terug te krijgen?',
        a: 'Ja. Een geschil over de waarborgsom is een van de meest voorkomende situaties. Je legt met bewijs uit waarom je (een deel van) de borg terug wilt; de mediator helpt naar een concrete terugbetalingsafspraak.',
      },
      {
        q: 'Werkt het ook als huurder en verhuurder een andere taal spreken?',
        a: 'Ja. Rsolve is meertalig: ieder typt in de eigen taal en de mediator vertaalt neutraal, zodat taal geen extra bron van misverstand is.',
      },
      {
        q: 'Is de afspraak juridisch bindend?',
        a: 'Als beide partijen akkoord gaan, legt Rsolve de afspraken vast in een vaststellingsovereenkomst (art. 7:900 BW). Die legt jullie eigen afspraken vast; laat het bij twijfel controleren door een jurist of de Huurcommissie.',
      },
      {
        q: 'Wat als de verhuurder of huurder niet meewerkt?',
        a: 'Deelname is vrijwillig. Lukt bemiddeling niet, dan houd je een gedocumenteerde poging. Rsolve kan je doorverwijzen naar de Huurcommissie, een jurist, of Het Juridisch Loket bij een laag inkomen.',
      },
    ],
    cta: {
      heading: 'Los het huurgeschil op zonder slepende procedure',
      body: 'Start een neutraal dossier, voeg je bewijs toe en nodig de andere partij uit voor een redelijke afspraak.',
      button: 'Start bemiddeling (€3,99)',
    },
    related: [
      { label: 'Burenruzie oplossen', to: '/burenruzie-oplossen' },
      { label: 'Juridische hulp nodig?', to: '/juridische-hulp' },
      { label: 'Wat een conflict kost', to: '/kosten-conflict' },
    ],
  },
};

export const LANDING_SLUGS = Object.keys(LANDINGS);
