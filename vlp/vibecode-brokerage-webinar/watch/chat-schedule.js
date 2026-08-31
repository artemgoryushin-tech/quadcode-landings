(() => {
  "use strict";

  const people = [
    ["Omar K.", "Dubai"], ["Sofia M.", "Lisbon"], ["Daniel R.", "London"],
    ["Aisha B.", "Lagos"], ["Marco T.", "Milan"], ["Julia S.", "Berlin"],
    ["Rafael C.", "São Paulo"], ["Nadia A.", "Cairo"], ["Leo G.", "Bogotá"],
    ["Anna P.", "Warsaw"], ["Miguel F.", "Madrid"], ["Sam K.", "Nairobi"],
    ["Andre L.", "Johannesburg"], ["Maya D.", "Manila"], ["Arif H.", "Jakarta"],
    ["Nina V.", "Belgrade"], ["Tom W.", "Manchester"], ["Sara J.", "Stockholm"],
    ["Emre Y.", "Istanbul"], ["Victor N.", "Mexico City"], ["Lina Q.", "Medellín"],
    ["Chris A.", "Toronto"], ["Bea M.", "Cebu"], ["Lucas P.", "Porto"],
    ["Ibrahim S.", "Abuja"], ["Kate R.", "Prague"], ["Noah E.", "Amsterdam"],
    ["Elena G.", "Barcelona"], ["Jay C.", "Singapore"], ["Marta K.", "Kraków"],
    ["Theo B.", "Athens"], ["Gabriel V.", "Rio de Janeiro"],
  ];
  const messages = [];
  let sequence = 0;

  const add = (at, text, personIndex = sequence) => {
    const [name, location] = people[Math.abs(personIndex) % people.length];
    sequence += 1;
    messages.push({
      id: `audience-${String(sequence).padStart(3, "0")}`,
      at: Number(at.toFixed(1)),
      name,
      location,
      text,
    });
  };

  const addCluster = (start, end, count, texts, seed = 1) => {
    let state = seed * 104729;
    const random = () => {
      state = (state * 48271) % 2147483647;
      return state / 2147483647;
    };
    const positions = Array.from({ length: count }, random).sort(
      (first, second) => first - second,
    );
    positions.forEach((position, index) => {
      add(start + (end - start) * position, texts[index % texts.length], index + seed * 7);
    });
  };

  addCluster(2, 18, 18, [
    "Hi everyone 👋", "Hello from London", "Made it!", "Good afternoon",
    "Hi Mila", "Joining from Dubai", "Hello Quadcode team", "Ready with coffee",
    "First Quadcode webinar for me", "Hey all", "Good to be here", "Hi from Brazil 🇧🇷",
    "Looking forward to this", "Hello hello", "Just joined", "Ready to take notes",
    "Great timing for us", "Hi from Manila",
  ], 2);

  addCluster(21, 37, 34, [
    "Loud and clear", "Audio is good", "I can see the screen", "All working here",
    "Clear from Lisbon", "Yep, video and sound are fine", "Looks good on mobile",
    "Perfect here 👍", "Can see you and the slides", "Sound is clear", "All good",
    "Confirmed", "Works from my side", "Crystal clear", "No issues here",
    "Good in Berlin", "Screen is visible", "Audio ✅ video ✅", "We can hear you",
    "Everything works", "Fine in Lagos", "Good to go", "Yes, all clear",
  ], 3);

  addCluster(55, 96, 28, [
    "Affiliate here", "I run paid traffic for a broker", "IB background, 4 years",
    "Considering my first brokerage", "We already have a trading community",
    "Affiliate, mostly LATAM traffic", "No brokerage experience yet",
    "I manage a small IB network", "Worked with two CFD brands before",
    "We have the audience but not the platform", "Exploring white label options",
    "Former account manager here", "Crypto affiliate moving into CFDs",
    "We are at the research stage", "Own a finance media site",
    "I have traders asking for our own brand", "Performance marketing background",
    "Launching would be new for my team", "Already comparing providers",
    "Interested in the operational side", "We have traffic in three GEOs",
  ], 4);

  addCluster(107, 145, 16, [
    "I've seen Quadcode at iFX EXPO", "First introduction for me",
    "I know the trading platform", "Heard about you through an affiliate partner",
    "We've tested the demo before", "New to Quadcode", "Saw your booth in Dubai",
    "A partner recommended you", "Familiar with the brand, not the brokerage solution",
    "I've used a broker powered by Quadcode", "First time hearing the full story",
    "I follow your LinkedIn", "Know the name, curious about the stack",
  ], 5);

  addCluster(205, 273, 12, [
    "Definitely not dead from what we see", "Retail demand is still strong in our GEO",
    "Three-month payback is ambitious", "The opportunity is real if retention works",
    "Our affiliate numbers grew this year", "Would love to understand the ROI assumptions",
    "Good framing: where, not whether", "Market selection is our biggest open question",
    "The 2026 data point is useful", "Demand is there, execution is the hard part",
  ], 6);

  addCluster(282, 374, 16, [
    "The platform is just one part of it", "Payments always become the bottleneck",
    "Legal structure is where we got stuck", "CRM from day one, noted",
    "We already have an acquisition plan", "App store publishing is another project",
    "This is exactly why a quick prototype isn't enough", "KYC and payments depend on GEO",
    "Does the setup include trader onboarding flows?", "A lot more than front-end code",
    "Retention needs to be designed before launch", "The integration list keeps growing 😅",
    "Can one entity cover multiple target markets?", "Useful checklist of dependencies",
  ], 7);

  addCluster(390, 478, 18, [
    "Brazil at number one is interesting", "Indonesia is huge for mobile traffic",
    "Colombia is on our shortlist", "Surprised the Philippines ranks fifth",
    "Nigeria has strong upside but payments are hard", "Do you share the full GEO report?",
    "We currently have traffic in Brazil", "How often do these scores change?",
    "Opportunity versus readiness is the key distinction", "Would Mexico be close to this list?",
    "Local payment rails can change the ranking", "Saving this slide",
    "The readiness score is more useful than raw market size", "Indonesia looks strong",
    "We operate in Colombia already", "Brazil + Indonesia as wave one makes sense",
  ], 8);

  add(592.4, "The slides disappeared for me—can anyone else still see them?", 29);
  addCluster(600, 613, 18, [
    "Still visible here", "I can see the screen", "All good on my side",
    "Slides are working", "Yes, still visible", "Fine in Chrome", "No issue here",
    "I can see it", "Visible on mobile", "Maybe refresh, Joe", "Screen is okay",
    "Still on the readiness chart", "Working here 👍",
  ], 9);

  addCluster(632, 808, 18, [
    "Launching in waves feels much safer", "Prove the model before adding GEOs",
    "Local fit is more than translation", "KYC support for local documents matters",
    "PSP coverage would decide our first market", "Can one CRM handle every wave?",
    "Retention is often left out of GEO research", "Would each GEO need separate support hours?",
    "This makes the build-vs-buy question clearer", "The operational layer is the real product",
    "Portuguese support is non-negotiable for Brazil", "Pix integration is a must",
    "Could the platform launch with one GEO and expand later?", "Five drivers—good framework",
    "This slide should be in the toolkit", "Risk and reporting change by market too",
  ], 10);

  addCluster(818, 1005, 22, [
    "Local payment methods are always the headache", "Built-in dealing and risk is a big advantage",
    "Can you add a new regional PSP?", "How long does KYC integration usually take?",
    "Does reporting split performance by acquisition source?", "Metabase is a solid choice",
    "Which liquidity providers are already connected?", "Fraud controls matter for bonus abuse",
    "A deeply integrated CRM saves months", "Does the affiliate module support CPA and rev share?",
    "Can we see failed deposits in the back office?", "This is why a UI prototype isn't a brokerage",
    "One vendor for the whole stack sounds easier", "Do you support custom risk rules?",
    "How quickly can a local payment method be added?", "CRM integration problems are very real",
    "The operating stack is larger than most founders expect", "24/7 support is hard to build alone",
  ], 11);

  addCluster(1024, 1084, 10, [
    "Screen paused for a second", "It's back now", "All good again",
    "Still following", "The audio stayed on", "No problem, we can see it",
    "Back on the customization slide", "Working here", "Yep, screen is back",
  ], 12);

  addCluster(1088, 1227, 18, [
    "$17k for the complete stack is clearer than separate vendors",
    "Cheap setup fees usually hide monthly costs", "Is liquidity included from day one?",
    "Two weeks to launch is fast", "What is included in ongoing support?",
    "A predictable total cost matters more than the headline", "PSP setup alone can get expensive",
    "Can we begin with web and add native apps later?", "Is there a minimum trading volume?",
    "The time saved is part of the ROI", "Would pricing change with a second brand?",
    "Can you share a full commercial breakdown?", "Three-month payback would be excellent",
    "This explains why coding the interface is the easy part", "The bundled CRM changes the comparison",
  ], 13);

  addCluster(1235, 1352, 12, [
    "The trader feedback is useful", "Would love a sandbox demo",
    "The launch checklist is the resource I need", "Does the calculator include marketing spend?",
    "Can the business plan be adapted by GEO?", "Account manager support matters after launch",
    "Good to hear this is an ongoing partnership", "We would need help with the first acquisition plan",
    "Can the demo focus on affiliate reporting?", "We have brand assets ready already",
    "A one-on-one planning call makes sense", "The 14-day timeline sounds much more realistic now",
  ], 14);

  addCluster(1360, 1434, 10, [
    "Connection dipped but you're back", "Audio is back now", "We can hear you again",
    "No worries, still here", "Back online 👍", "Slides are visible",
    "The demo invitation is clear", "Still watching", "All good now",
  ], 15);

  addCluster(1440, 1510, 18, [
    "I'll message after this", "Scanning the code now", "Would like to book a demo",
    "Can the team review our current funnel?", "We are targeting a Q4 launch",
    "Do you support Arabic localization?", "Can we bring our own compliance partner?",
    "Is the platform available in Portuguese?", "Would love to see the mobile trader experience",
    "Can the demo include the affiliate back office?", "What do you need from us before the call?",
    "I have a payments question", "Does the team help with app-store submission?",
    "We'll reach out this week", "Thanks for sharing a direct contact",
  ], 16);

  addCluster(1513, 1572, 18, [
    "Very useful session, thank you", "Thanks Mila!", "Great overview 👏",
    "Appreciate the honest cost comparison", "Sending this to my partner",
    "The infrastructure breakdown was the best part", "Thanks from Lisbon",
    "Clear and practical", "Will book a demo", "Thank you Quadcode team",
    "Good session", "See you on the call", "Thanks everyone", "Bye 👋",
    "This answered a lot", "Helpful webinar", "Speak soon", "Great job",
  ], 17);

  globalThis.QUADCODE_WEBINAR_CHAT = messages.sort(
    (first, second) => first.at - second.at,
  );
})();
