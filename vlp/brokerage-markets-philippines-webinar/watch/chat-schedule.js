(() => {
  "use strict";

  const firstNames = [
    "Aaron", "Abby", "Adrian", "Aileen", "Alex", "Angela", "Bea", "Ben",
    "Bianca", "Carlo", "Cathy", "Christian", "Dan", "Denise", "Dianne",
    "Ella", "Enzo", "Erika", "Francis", "Gab", "Gian", "Grace", "Ian",
    "Janelle", "Jay", "Joana", "Jon", "Joshua", "Kara", "Kate", "Kevin",
    "Kim", "Kyle", "Lance", "Lea", "Luis", "Mae", "Marco", "Maria",
    "Mark", "Miguel", "Mika", "Nico", "Patricia", "Paulo", "Rafael",
    "Ria", "Sam", "Sean", "Sofia", "Trisha", "Vince",
  ];
  const surnameInitials = [
    "A.", "B.", "C.", "D.", "E.", "F.", "G.", "L.", "M.", "P.",
    "R.", "S.", "T.", "V.", "Y.",
  ];
  const places = [
    "Manila", "Cebu", "Davao", "Iloilo", "Quezon City", "Makati",
    "Taguig", "Pasig", "Mandaluyong", "Caloocan", "Parañaque", "Las Piñas",
    "Baguio", "Bacolod", "Cagayan de Oro", "General Santos", "Zamboanga",
    "Antipolo", "Batangas", "Cavite", "Laguna", "Pampanga", "Bulacan",
    "Rizal", "Tarlac", "Nueva Ecija", "La Union", "Pangasinan", "Naga",
    "Legazpi", "Tacloban", "Dumaguete", "Caticlan", "Boracay", "Bohol",
    "Butuan", "Surigao", "Cotabato", "Tagum", "Puerto Princesa",
    "Singapore", "Kuala Lumpur", "Jakarta", "Bangkok", "Dubai",
  ];
  const messages = [];
  let sequence = 0;

  const participant = (index, location = "") => ({
    name: `${firstNames[(index * 17 + 9) % firstNames.length]} ${surnameInitials[(index * 11 + 4) % surnameInitials.length]}`,
    location: location || places[(index * 7 + 3) % places.length],
  });

  const add = (at, text, index = sequence, location = "") => {
    const author = participant(index, location);
    sequence += 1;
    messages.push({
      id: `audience-${String(sequence).padStart(3, "0")}`,
      at: Number(at.toFixed(1)),
      name: author.name,
      location: author.location,
      text,
    });
  };

  const addCluster = (start, end, count, texts, seed = 0) => {
    const span = Math.max(0, end - start);
    let randomState = (seed + 1) * 7919;
    const random = () => {
      randomState = (randomState * 48271) % 2147483647;
      return randomState / 2147483647;
    };
    const positions = Array.from({ length: count }, () => random()).sort(
      (first, second) => first - second,
    );

    positions.forEach((position, index) => {
      add(start + span * position, texts[index % texts.length], index + seed * 19);
    });
  };

  addCluster(0.6, 8.5, 20, [
    "Hi sa lahat 👋", "Hello!", "Magandang hapon", "Hi Quadcode team",
    "Buti umabot ako", "Hello from PH 🇵🇭", "Excited ako dito",
    "Good day sa lahat", "Hi guys", "Ready na ang notes ko", "Hello po!",
    "First webinar ko dito", "Salamat sa pag-host", "Kasama ko ang team ko",
    "Mabuhay!", "Hello hello", "All set na", "Buti nakaabot sa live",
    "Magandang hapon mula PH", "Hi everyone, game na 🙌",
  ], 1);

  const cityReplies = Array.from({ length: 65 }, (_, index) => {
    const city = places[index % places.length];
    const variants = [
      `${city} here po 👋`, `Joining from ${city}`, `${city} present!`,
      `Hello mula ${city}`, `Nanonood mula ${city}`, `${city} po 🙌`,
      `May isa pa from ${city}`, `Team ${city} nandito`, `${city} checking in`,
      `Magandang hapon mula ${city}`,
    ];
    return { city, text: variants[index % variants.length] };
  });

  cityReplies.forEach(({ city, text }, index) => {
    const at = 2 + (15.5 * index) / (cityReplies.length - 1) + ((index * 7) % 4) / 10;
    add(at, text, index + 60, city);
  });

  addCluster(23.8, 33, 40, [
    "+", "+1", "+ ready", "+ po", "Ready +", "+ from Manila", "+ 🙌",
    "Let's go +", "+ here", "+ yes", "Ready na +", "+ all good",
    "Present +", "+ excited", "Game +", "+ with coffee 😅", "+✅",
    "Yep +", "+ loud and clear", "Ready when you are +",
  ], 3);

  addCluster(36, 104, 12, [
    "Gumagana ang chat 👍", "Malinaw ang audio dito", "Kita nang maayos ang slides",
    "Dito ko ilalagay ang questions ko", "Okay sa mobile", "Clear from Cebu",
    "Salamat, noted", "Interested ako sa affiliate side", "Game, simulan na natin",
    "Gusto kong maintindihan ang real setup cost", "Nakakasunod naman", "Crystal clear",
  ], 4);

  addCluster(108, 180, 12, [
    "May sense ang fractional shares para sa retail", "So depende ang model sa risk setup",
    "Mas mabilis ang three-month payback kaysa expected ko", "Nagno-notes ako sa ARPU",
    "Kasama ba ang marketing spend sa payback?", "Mukhang retention talaga ang key",
    "Interesting point about spreads vs P&L", "Would love a sample forecast",
    "This is useful for affiliates planning to become operators",
    "Is 7,300 PHP a typical ARPU?", "The revenue model is much clearer now",
    "Curious how much volume the example assumes",
  ], 5);

  addCluster(193, 322, 15, [
    "The legal entity part is usually where we get stuck",
    "Payments per country sounds like the hardest part",
    "Do you help with app store publishing too?", "CRM from day one, noted",
    "How long does the full setup usually take?", "Good checklist of moving parts",
    "Acquisition needs to be planned before the build", "We already have affiliate traffic",
    "Can the same platform support two brands?", "Regulation changes the whole setup",
    "This is more than just buying software", "Local payment rails matter a lot in PH",
    "Would be useful to know what we need before onboarding",
    "The integration stage is always underestimated", "Clear process so far",
  ], 6);

  addCluster(328, 476, 20, [
    "Surprised Brazil ranks that high", "Philippines is our home market 🇵🇭",
    "Indonesia is huge but localization is different", "Colombia is interesting for affiliates",
    "Nigeria has strong traffic but payments are tricky", "Would you start in PH first?",
    "Opportunity and readiness are two different things, good point",
    "The readiness score is the useful part", "Do you have the full GEO report?",
    "We currently run traffic in Brazil and the Philippines",
    "PH feels easier operationally for our team", "How often are these scores updated?",
    "Is the index based on deposits or trading activity?", "Indonesia at 88 is impressive",
    "This comparison is exactly what I needed", "Local compliance can change the ranking fast",
    "Does acquisition cost factor into the score?", "Would Mexico be in the next five?",
    "Starting where the team has local knowledge makes sense", "Saving this slide",
  ], 7);

  addCluster(482, 638, 18, [
    "Launching in waves feels much safer", "Wave two for PH makes sense",
    "Trying five countries together would be chaos", "Prove the model, then localize deeper",
    "What team size do you recommend for wave one?", "Payments should probably lead localization",
    "For us PH + Indonesia could be the first wave", "Good to see compliance called out early",
    "Retention is often forgotten in GEO research", "Local fit is more than translation",
    "Do you help choose local acquisition channels?", "Nigeria later with tighter controls, got it",
    "The five drivers make the decision practical", "Would each GEO need a separate entity?",
    "Can one CRM manage all five markets?", "We have strong creators in Colombia already",
    "This is a much better framework than just market size", "Need this slide in the toolkit",
  ], 8);

  addCluster(646, 858, 18, [
    "Dealing desk + risk team is a serious operation", "Local payment methods are non-negotiable",
    "Apple Pay and crypto cover many use cases", "Can you add a Philippine e-wallet PSP?",
    "Built-in analytics saves months", "Which liquidity providers are included?",
    "Cybersecurity is easy to overlook at the start", "KYC drop-off is our biggest concern",
    "Built-in CRM is a big advantage", "Does the affiliate module support rev share and CPA?",
    "Can we see failed deposit attempts in the back office?", "Omnichannel retention is key",
    "Do you support local KYC documents?", "One vendor for this stack would be easier",
    "How long does a new payment integration take?", "Risk controls matter for bonus abuse too",
    "Does reporting split performance by GEO?", "The operational stack is bigger than expected",
  ], 9);

  addCluster(874, 951, 10, [
    "150+ CFDs is plenty for launch", "70+ crypto assets is strong",
    "PWA is useful for phones with limited storage", "24/7 support is a real cost saver",
    "Can the app be fully branded?", "Good that traders won't see Quadcode branding",
    "Do we own the domain and store accounts?", "Can chart layouts be customized?",
    "Would love to see the mobile app demo", "The local product mix still matters",
  ], 10);

  addCluster(956, 1029, 12, [
    "$17.5k including the stack is clearer than separate vendor fees",
    "The total cost comparison is what matters", "Cheap setup fees can be misleading",
    "Does the fee include liquidity from day one?", "We need a predictable monthly model",
    "Integrations and bugs can cost more than software", "Is there a minimum monthly volume?",
    "Can you share a full commercial breakdown?", "What is included in ongoing support?",
    "A turnkey setup is easier to budget", "How does pricing change with more GEOs?",
    "The time saved is part of the ROI too",
  ], 11);

  addCluster(1034, 1120, 10, [
    "Clear answer on MT5", "Proprietary platform noted", "Good to know the limitation upfront",
    "What charting tools are supported?", "No external liquidity, understood",
    "Would like to compare execution quality", "The complete stack explains the setup price",
    "Do you offer a sandbox before launch?", "Can we review the API documentation?",
    "Thanks for answering directly",
  ], 12);

  addCluster(1122, 1212, 10, [
    "The launch checklist would be very useful", "Profit calculator is the one I want",
    "Great for IBs moving into brokerage ownership", "Do the materials arrive by email?",
    "The business plan template will save us time", "Does the calculator include marketing costs?",
    "Would love the market report after this", "Licensing depends on the jurisdiction, understood",
    "Can you recommend local legal advisers?", "Practical resources, not just slides 👍",
  ], 13);

  addCluster(1220, 1319, 10, [
    "Long-term support is important", "Good that this is positioned as a partnership",
    "One-on-one planning would help our team", "We already have brand assets ready",
    "Can the demo focus on affiliate reporting?", "Will message the team after this",
    "A tailored launch plan sounds useful", "We are targeting a Q4 launch",
    "Thanks, this answered a lot already", "Scanning the contact code now",
  ], 14);

  addCluster(1320, 1403, 15, [
    "Built-in CRM, got it", "Blitz options answer was clear", "Good to know upgrades are flexible",
    "Recurring fees by volume makes sense", "Will request the detailed proposal",
    "Very practical session, thank you", "Thanks from Cebu!", "Great webinar 👏",
    "Sending this to my partner", "Appreciate the honest answers", "Salamat!",
    "Will reach out on Telegram", "Thanks Quadcode team", "Useful session for affiliates",
    "Bye everyone 👋",
  ], 15);

  [
    [179.5, "Carlo M.", "Manila", "Magkano realistically ang puwede kong kitain sa first month?"],
    [1028.5, "Miguel R.", "Cebu", "Puwede bang ikonekta ang MT5, at ano ang minimum setup cost?"],
    [1093.5, "Angela P.", "Makati", "Puwede ko bang ikonekta ang sarili naming liquidity provider?"],
    [1145.5, "Sean D.", "Davao", "Kailangan ko ba ng brokerage license bago magsimula?"],
    [1323.5, "Patricia L.", "Quezon City", "Puwede bang ikonekta ang external CRM na gamit na namin?"],
    [1332.5, "Kevin S.", "Iloilo", "Ano ang difference ng binary options at Blitz options?"],
    [1345.5, "Ria C.", "Taguig", "Puwede ba akong magsimula sa lower package at mag-upgrade later?"],
    [1372.5, "Mark A.", "Pasig", "Ano ang recurring fees, at paano naka-structure ang pricing?"],
  ].forEach(([at, name, location, text], index) => {
    messages.push({
      id: `question-${String(index + 1).padStart(2, "0")}`,
      at,
      name,
      location,
      text,
    });
  });

  globalThis.QUADCODE_WEBINAR_CHAT = messages.sort(
    (first, second) => first.at - second.at,
  );
})();
