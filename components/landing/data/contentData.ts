import { ScenarioItem, FaqItem, DesignToken } from '../types';

export const SCENARIOS: ScenarioItem[] = [
  {
    id: 'buren-erfgrens',
    category: 'buren',
    categoryLabel: 'Buren & Wonen',
    title: 'Hoge coniferenhaag & overlast zonlicht in de tuin',
    partyA: {
      name: 'Sanne (Buurvrouw Links)',
      role: 'Eigenaar hoekwoning',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Die gigantische bomen van Mark blokkeren al 3 zomers mijn hele zon! Als hij ze niet binnen twee weken tot 2 meter snoeit, schakel ik juridische bijstand in.',
      hiddenNeed: 'Wilt meer natuurlijk daglicht op haar terras en een respectvolle buurverstandhouding.'
    },
    partyB: {
      name: 'Mark (Buurman Rechts)',
      role: 'Eigenaar tussenwoning',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Sanne eist gewoon dat ik mijn 15 jaar oude privacyhaag kaalkap! De coniferen houden juist wind en inkijk tegen. Ik laat me niet intimideren met advocaten.',
      hiddenNeed: 'Wilt privacy behouden en vindt volledige kap zonde van de volgroeide haag.'
    },
    neutralizedSummary: 'Beide partijen hechten veel waarde aan rustig woongenot. Partij A verlangt meer zonlicht op het terras, terwijl Partij B privacy en bescherming tegen wind wenst te behouden.',
    aiMediationDialogue: [
      {
        speaker: 'ai',
        text: 'Welkom Sanne en Mark. Ik ben RSolve. Mijn rol is 100% neutraal: we gaan niet kijken wie er "schuld" heeft, maar hoe jullie allebei met een goed gevoel in de tuin kunnen zitten. Sanne wil meer licht; Mark wil zijn privacy behouden.'
      },
      {
        speaker: 'partyA',
        text: 'Als de bovenste meter eraf gaat, heb ik vanaf 14:00 zon op het terras. Maar ik snap dat Mark niet wil dat we direct bij hem naar binnen kijken.'
      },
      {
        speaker: 'partyB',
        text: 'Als we ter hoogte van het terras tot 2,40 meter toppen en aan de achterzijde een natuurlijk houten privacyscherm plaatsen, is het licht voor Sanne vrij en behoud ik mijn privacy.'
      },
      {
        speaker: 'ai',
        text: 'Uitstekend. Dit brengt beide belangen samen. Zullen we dit vastleggen inclusief afspraak over de snoeikosten (50/50) in het eerste weekend van oktober?'
      }
    ],
    generatedAgreement: {
      points: [
        'Haag wordt op zaterdag 4 oktober gezamenlijk teruggesnoeid tot 2,40m.',
        'Kosten voor afvoer snoeiafval (€90) worden gelijkelijk 50/50 gedeeld.',
        'Mark plaatst een esthetisch privacyscherm van 2m breed aan zijn loungezijde.',
        'Jaarlijks onderhoud vindt plaats in oktober na voorafgaand vriendelijk overleg.'
      ],
      bindingType: 'Vaststellingsovereenkomst (Art. 7:900 BW)',
      resolutionTimeMin: 9,
      satisfactionScore: 98
    }
  },
  {
    id: 'zakelijk-factuur',
    category: 'zakelijk',
    categoryLabel: 'Zakelijk & Freelance',
    title: 'Betwiste scopewijziging & openstaande factuur van €3.400',
    partyA: {
      name: 'Daan (Freelance UX Lead)',
      role: 'Opdrachtnemer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Ik heb 40 uur extra gewerkt aan onverwachte revisies. Nu weigert de klant de meerwerkfactuur te betalen en houdt hij de livegang tegen.',
      hiddenNeed: 'Wilt eerlijke erkenning voor geleverde uren en snelle liquiditeit.'
    },
    partyB: {
      name: 'Elena (Founder Scale-up)',
      role: 'Opdrachtgever',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Er is nooit schriftelijk akkoord gegeven op extra uren boven het fixed-fee budget. We voelen ons overvallen door deze onverwachte rekening.',
      hiddenNeed: 'Wilt het project op tijd lanceren zonder onvoorspelbare budgetoverschrijding.'
    },
    neutralizedSummary: 'Opdrachtnemer heeft substantiële extra waarde geleverd; Opdrachtgever werd geconfronteerd met ongeautoriseerd meerwerk. Beide partijen wensen een succesvolle productlancering en afronding.',
    aiMediationDialogue: [
      {
        speaker: 'ai',
        text: 'Daan en Elena, jullie doel is hetzelfde: een vlekkeloze lancering vóór het einde van het kwartaal. Laten we de deliverables loskoppelen van emoties en een zakelijk evenwicht vinden.'
      },
      {
        speaker: 'partyB',
        text: 'De extra flows waren van hoge kwaliteit. We kunnen 65% van het meerwerk direct overboeken als Daan ook de laatste QA handover documenteert.'
      },
      {
        speaker: 'partyA',
        text: 'Als €2.200 binnen 5 werkdagen wordt voldaan, lever ik morgenochtend de QA documentatie op en is het dossier gesloten.'
      }
    ],
    generatedAgreement: {
      points: [
        'Opdrachtgever voldoet een schikkingsbedrag van €2.200 binnen 5 werkdagen.',
        'Opdrachtnemer levert definitieve QA documentatie en bronbestanden op binnen 24 uur.',
        'Partijen verlenen elkaar over en weer finale kwijting na betaling.'
      ],
      bindingType: 'Zakelijke Finale Kwijting Overeenkomst',
      resolutionTimeMin: 11,
      satisfactionScore: 100
    }
  },
  {
    id: 'werk-team',
    category: 'werk',
    categoryLabel: 'Werkplek & Samenwerking',
    title: 'Verstoorde communicatie en onduidelijke rolverdeling',
    partyA: {
      name: 'Lars (Senior Developer)',
      role: 'Lead Tech',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Mariam verandert zonder overleg deadlines in Jira en communiceert passief-agressief in Slack channels.',
      hiddenNeed: 'Wilt autonomie over technische inschattingen en respectvolle communicatie.'
    },
    partyB: {
      name: 'Mariam (Product Manager)',
      role: 'Product Owner',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Lars houdt updates achter waardoor ik stakeholders niet kan informeren. Ik word verantwoordelijk gehouden voor vertragingen.',
      hiddenNeed: 'Wilt voorspelbare statusinzichten naar het management.'
    },
    neutralizedSummary: 'Beide teamleden ervaren hoge druk door asynchrone communicatiekloven. Behoefte aan een helder afgestemd wekelijks ritme en eenduidige eigenaarschap van Jira tickets.',
    aiMediationDialogue: [
      {
        speaker: 'ai',
        text: 'Beide perspectieven zijn volkomen begrijpelijk. Mariam heeft stakeholderdruk; Lars heeft focus en technische integriteit nodig. Laten we een strak communicatieprotocol opstellen.'
      }
    ],
    generatedAgreement: {
      points: [
        'Deadline-aanpassingen gebeuren uitsluitend in de wekelijkse maandagochtend sprint sync.',
        'Lars werkt dagelijks om 16:30 de Jira status bij in 3 korte bullet points.',
        'Gevoelige feedback wordt uitsluitend via 1-op-1 videocall besproken, nooit in publieke Slack channels.'
      ],
      bindingType: 'Interne Werkafspraken Overeenkomst',
      resolutionTimeMin: 8,
      satisfactionScore: 96
    }
  },
  {
    id: 'huur-borg',
    category: 'huur',
    categoryLabel: 'Huurder & Verhuurder',
    title: 'Inhouding van €1.250 borg na oplevering appartement',
    partyA: {
      name: 'Tim (Vertrekkend Huurder)',
      role: 'Particulier',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Het appartement is brandschoon opgeleverd. Toch houdt de huisbaas de complete borg in voor zogenaamde schilderwerkjes.',
      hiddenNeed: 'Wilt zijn geld terug waar hij recht op heeft.'
    },
    partyB: {
      name: 'Klaas (Verhuurder)',
      role: 'Vastgoedeigenaar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      initialStatement: 'Er zaten meerdere boorgaten in de gestuukte woonkamermuur en de oven was niet professioneel ontvet.',
      hiddenNeed: 'Wilt het pand direct representatief kunnen verhuren aan de volgende expat.'
    },
    neutralizedSummary: 'Partijen verschillen van mening over de grens tussen normale gebruikersslijtage en opleverschade. Behoefte aan een reële verrekening zonder slepende procedures.',
    aiMediationDialogue: [
      {
        speaker: 'ai',
        text: 'Gebruikersslijtage is wettelijk voor rekening van de verhuurder, terwijl specifieke boorgaten en dieptereiniging hersteld dienen te worden. Een professionele schilder/reiniging kost gemiddeld €220.'
      }
    ],
    generatedAgreement: {
      points: [
        'Verhuurder verrekent eenmalig €220 voor herstel boorgaten en ovenreiniging.',
        'Het restantbedrag van €1.030 wordt binnen 48 uur teruggestort op de rekening van Tim.',
        'Beide partijen verklaren dat de huurovereenkomst daarmee definitief en correct is beëindigd.'
      ],
      bindingType: 'Vaststellingsovereenkomst Huurgeschil',
      resolutionTimeMin: 10,
      satisfactionScore: 99
    }
  }
];

export const DESIGN_GUIDE_TOKENS: DesignToken[] = [
  {
    name: 'Logo Emerald (Primary Brand Accent)',
    category: 'color',
    token: '--color-logo-emerald',
    value: '#10B981',
    usage: 'Primaire merkkleur direct uit het RSolve logo. Gebruikt voor actieknoppen, statuspuls en actieve de-escalatie indicatoren.',
    wcagContrast: '14.8:1 (AAA)'
  },
  {
    name: 'Logo Mint Bright (Glow & High Contrast)',
    category: 'color',
    token: '--color-logo-mint-bright',
    value: '#34D399',
    usage: 'Highlights, hover-states en micro-interacties afgeleid van het bovenste gradiëntsegment van het logo.',
    wcagContrast: '16.2:1 (AAA)'
  },
  {
    name: 'Deep Forest (Canvas Background)',
    category: 'color',
    token: '--color-bg-forest',
    value: '#051410',
    usage: 'Hoofdachtergrond. Diepe donkergroene slate die rust en autoriteit uitstraalt zonder kille schaduwen.',
    wcagContrast: '19.8:1 (AAA)'
  },
  {
    name: 'Forest Surface (Card & Container)',
    category: 'color',
    token: '--color-surface-forest',
    value: '#07241D',
    usage: 'Secundaire containerachtergronden, simulator modules en panelen met 1px emerald/20 hairlines.',
    wcagContrast: 'Pass'
  },
  {
    name: 'Logo Gold Accent (Legal & Trust Sparkle)',
    category: 'color',
    token: '--color-logo-gold',
    value: '#F59E0B',
    usage: 'Gouden accentster en zegels voor juridische certificeringen (Art. 7:900 BW) en 100% tevredenheidsgaranties.',
    wcagContrast: '12.4:1 (AA)'
  },
  {
    name: 'Sage White (Primary Editorial Text)',
    category: 'color',
    token: '--color-text-primary',
    value: '#F0FDF4',
    usage: 'Hoofdtekst, redactionele koppen en primaire interface elementen voor optimale leesbaarheid.',
    wcagContrast: '19.2:1 (AAA)'
  },
  {
    name: 'Editorial Display (Inter Display)',
    category: 'typography',
    token: '--font-display',
    value: 'Inter Display / Space Grotesk, sans-serif',
    usage: 'Titels, redactionele statements en hero typography met strakke tracking (-0.04em)',
  },
  {
    name: 'Technical Code (JetBrains Mono)',
    category: 'typography',
    token: '--font-mono',
    value: 'JetBrains Mono, monospace',
    usage: 'Art. 7:900 BW timestamps, hashes, sessie-ID’s, prijstags en tracking badges',
  },
  {
    name: 'Emerald Hairline Grid & Borders',
    category: 'radius',
    token: '--border-editorial',
    value: '1px solid rgba(16, 185, 129, 0.2)',
    usage: 'Subtiele afbakening van modules zonder visuele ruis of overmatige schaduwen',
  },
  {
    name: 'Pill Radius vs Sharp Box',
    category: 'radius',
    token: '--radius-editorial',
    value: '999px (pill) / 16px (card)',
    usage: 'Pill-badges en actieknoppen versus strak begrensde redactionele kaarten',
  }
];

export const FAQS: FaqItem[] = [
  {
    question: 'Is een overeenkomst via RSolve juridisch bindend?',
    answer: 'Ja. Wanneer beide partijen akkoord gaan met de gemaakte afspraken, genereert RSolve een officiële Vaststellingsovereenkomst conform Artikel 7:900 van het Nederlands Burgerlijk Wetboek (BW). Deze is wettelijk bindend en rechtsgeldig voor beide partijen.',
    category: 'legal'
  },
  {
    question: 'Hoe blijft RSolve gegarandeerd 100% neutraal en objectief?',
    answer: 'In tegenstelling tot menselijke bemiddelaars heeft onze AI geen persoonlijke vooroordelen, vermoeidheid of subjectieve sympathieën. Het model is getraind op de Harvard Negotiation Project principes (interest-based bargaining): scheid mensen van het probleem, focus op achterliggende belangen en zoek naar win-win uitkomsten.',
    category: 'process'
  },
  {
    question: 'Wat als de andere partij een andere taal spreekt?',
    answer: 'Geen enkel probleem. Partij A kan bijvoorbeeld in het Nederlands typen, terwijl Partij B in het Pools, Engels, Spaans of Turks typt. RSolve vertaalt alle input realtime, haalt emotionele ladingen eruit en presenteert neutrale vertalingen aan beide kanten.',
    category: 'process'
  },
  {
    question: 'Wat kost het en zijn er verborgen abonnementskosten?',
    answer: 'Een volledige bemiddelingssessie inclusief concrete afspraken en exporteerbare overeenkomst kost eenmalig slechts €3,99 per dossier. Er zijn geen abonnementen, geen uurtarieven van €200+, en geen dossierkosten.',
    category: 'pricing'
  },
  {
    question: 'Hoe zit het met privacy en vertrouwelijkheid (AVG / GDPR)?',
    answer: 'Jullie privacy staat voorop. Alle communicatie is end-to-end versleuteld (TLS 1.3). De ingevoerde persoonsgegevens en chatberichten worden NOOIT gebruikt om publieke AI-modellen te trainen en kunnen na afronding van de sessie direct permanent worden gewist.',
    category: 'privacy'
  }
];
