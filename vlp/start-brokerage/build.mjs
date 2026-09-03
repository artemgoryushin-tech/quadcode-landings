import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const directory = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(directory, "../start-brokerage-id/ph/index.html");
const outputPath = path.join(directory, "index.html");

let html = await readFile(templatePath, "utf8");

const replacements = [
  ['<html lang="en-PH">', '<html lang="en">'],
  ['<title>Simulan ang Sarili Mong Brokerage | Quadcode Brokerage Solutions</title>', '<title>Start a Forex Brokerage Firm | Quadcode White Label Platform</title>'],
  ['content="Simulan ang sarili mong brokerage sa ilalim ng brand mo. Ready na ang trading platform, apps, payments, CRM, dealing, at launch support mula sa Quadcode."', 'content="Start a Forex brokerage firm under your own brand with a complete white label platform, CRM, payments, risk management and launch support from Quadcode."'],
  ['href="https://quadcode.com/vlp/start-brokerage-id/ph/"', 'href="https://quadcode.com/vlp/start-brokerage/"'],
  ['content="https://quadcode.com/vlp/start-brokerage-id/ph/"', 'content="https://quadcode.com/vlp/start-brokerage/"'],
  ['content="Simulan ang Sarili Mong Brokerage | Quadcode"', 'content="Start Your Own Forex Brokerage | Quadcode"'],
  ['content="Brand mo. Clients mo. Brokerage mo. Mag-launch gamit ang ready-to-run infrastructure ng Quadcode."', 'content="Start your own Forex brokerage with ready-to-run trading technology, payments, CRM, dealing and risk infrastructure from Quadcode."'],
  ['content="en_PH"', 'content="en_US"'],
  ['../assets/', '../start-brokerage-id/assets/'],
  ['>Negosyo<', '>Business<'],
  ['>Plataporma<', '>Platform<'],
  ['>Paano Magsimula<', '>How to Start<'],
  ['>Mga Tanong<', '>FAQ<'],
  ['>Simulan ang Brokerage Ko<', '>Start My Brokerage<'],
  ['>Nakaraang linggo<', '>Last week<'],
  ['>Mga active trader<', '>Active traders<'],
  ['>Nakaraang taon<', '>Last year<'],
  ['>Bagong user<', '>New user<'],
  ['<span>Simulan ang</span>', '<span>Start a</span>'],
  ['<span><span class="hero-grow__hl">Sarili Mong Brokerage</span></span>', '<span><span class="hero-grow__hl">Forex Brokerage</span></span>'],
  ['<span>Sa <span class="hero-grow__hl">Brand Mo</span></span>', '<span>Under <span class="hero-grow__hl">Your Brand</span></span>'],
  ['Brand mo. Clients mo. Brokerage mo.', 'Your brand. Your clients. Your brokerage.'],
  ['<strong>Launch-ready:</strong> sa loob ng 14 days', '<strong>Launch-ready:</strong> from 14 days'],
  ['<strong>Ready na at kami ang bahala sa infrastructure:</strong> platform, apps, payments, CRM, risk management, at operations.', '<strong>Ready-to-run infrastructure:</strong> platform, apps, payments, CRM, risk management and operations.'],
  ['aria-label="Ready-to-run na brokerage business"', 'aria-label="Everything you need to start a brokerage firm"'],
  ['Sa Iyo ang Relasyon sa mga Kliyente', 'Own the Client Relationship'],
  ['Gawing sarili mong brokerage business ang traffic mo.', 'Turn your acquisition into your own brokerage business.'],
  ['Kasama ang Pamamahala ng Risk at Dealing', 'Risk Management &amp; Dealing Included'],
  ['Kami ang bahala sa technical core. Ikaw ang focus sa growth.', 'We handle the technical core. You focus on distribution and growth.'],
  ['>LUN<', '>MON<'],
  ['>MAR<', '>TUE<'],
  ['>MIY<', '>WED<'],
  ['>HUW<', '>THU<'],
  ['>BIY<', '>FRI<'],
  ['>SAB<', '>SAT<'],
  ['>LIN<', '>SUN<'],
  ['Mas Malaki ang Kita sa Bawat Trader', 'Keep More Value from Every Trader'],
  ['Hanggang 85% na bahagi ng kita', 'Up to 85% revenue share'],
  ['Mas malaking bahagi ng kita ang mapupunta sa brokerage mo.', 'A larger share of the revenue stays with your brokerage.'],
  ['<h3><strong>Traffic mo</strong>, kita mo</h3>', '<h3><strong>Your traffic</strong>, your revenue</h3>'],
  ['>Rehistro<', '>Registrations<'],
  ['>Pag-convert<', '>Conversion<'],
  ['>Mga Click<', '>Clicks<'],
  ['>Mga View<', '>Views<'],
  ['>Mga Withdrawal<', '>Withdrawals<'],
  ['Bantayan ang Buong Negosyo Mo', 'Monitor Your Entire Brokerage Business'],
  ['Traders, revenue, at marketing—lahat nasa isang dashboard.', 'Traders, revenue and marketing performance—all in one back office.'],
  ['alt="Rehistradong user"', 'alt="Registered user"'],
  [">12 Nob '25<", ">12 Nov '25<"],
  [">28 Okt '25<", ">28 Oct '25<"],
  [">19 Nob '25<", ">19 Nov '25<"],
  [">03 Dis '25<", ">03 Dec '25<"],
  ['>Unang Deposit<', '>First Deposit<'],
  ['Ikaw ang May Kontrol sa Pag-convert ng mga Kliyente', 'Control the Full Client Conversion Flow'],
  ['I-manage ang rehistro, payments, at trading flow.', 'Manage registration, payments and the trading journey in one system.'],
  ['Mag-launch Mabilis. Mag-scale nang Walang Rebuild.', 'Launch Fast. Scale Without Rebuilding.'],
  ['Lumago gamit ang infrastructure na ginawa para sa brokerage operations.', 'Grow on infrastructure designed for brokerage operations.'],
  ['Kumpletong Trading Platform<br>Sa Ilalim ng Brand Mo', 'Everything You Need to<br>Start a Brokerage Firm'],
  ['Web, mobile, payments, at operations—connected mula day one.', 'A complete white label Forex brokerage platform: web, mobile, payments and operations connected from day one.'],
  ['Malinis na<br>Disenyo', 'Clean<br>Trader UX'],
  ['Simple at magaan na interface para madaling gamitin ng traders.', 'A clear, lightweight interface designed to be easy for traders to use.'],
  ['Isang Simpleng<br>Daloy', 'One Simple<br>Trading Flow'],
  ['Buy at sell in one click. Madaling intindihin mula sa simula.', 'Buy and sell in one click, with a journey that is clear from the start.'],
  ['Mas Maraming<br>Nagko-convert', 'Built to<br>Convert'],
  ['Simple interface para mas maraming traders ang makapag-start agad.', 'A focused interface that helps more traders complete onboarding and start.'],
  ['Ready ang Payments', 'Payments Ready'],
  ['Integrated na payment methods para mabilis ang deposits.', 'Integrated payment methods help clients fund their accounts faster.'],
  ['Mas Malaking Kita sa Iyo', 'More Revenue Stays with You'],
  ['Sa brokerage mo mananatili ang mas malaking revenue mula sa traffic mo.', 'Keep a larger share of the value generated by your brokerage.'],
  ['Gumagana sa bawat device. Bigyan ang traders mo ng <strong>smooth trading experience</strong> sa web at mobile.', 'Works across devices. Give traders a <strong>consistent trading experience</strong> on web and mobile.'],
  ['aria-label="Mga hakbang sa pag-launch ng brokerage"', 'aria-label="How to start a Forex brokerage business"'],
  ['Mula Idea Hanggang Live Brokerage', 'How to Start a Forex Brokerage Business'],
  ['Apat na malinaw na hakbang. Hindi mo kailangang gumawa ng technology mula zero.', 'Four clear steps to start your own brokerage firm without building the technology from scratch.'],
  ['>Hakbang 1<', '>Step 1<'],
  ['>Hakbang 2<', '>Step 2<'],
  ['>Hakbang 3<', '>Step 3<'],
  ['>Hakbang 4<', '>Step 4<'],
  ['Mag-request ng Demo', 'Request a Demo'],
  ['Piliin ang Setup Mo', 'Choose Your Setup'],
  ['Ilagay ang Brand Mo', 'Apply Your Brand'],
  ['Mag-launch at Lumago', 'Launch and Grow'],
  ['Mga Madalas<br>Itanong', 'Frequently Asked<br>Questions'],
  ['May tanong pa? Kumuha ng launch plan na akma sa market at business model mo.', 'Get a launch plan matched to your target market and brokerage business model.'],
  ['Kausapin ang Team Namin', 'Talk to Our Team'],
  ['Ano ang kailangan para makapagsimula?', 'How do I start a Forex brokerage?'],
  ['Kailangan namin ang target market, business plan, at brand direction mo. Kami ang bahala sa technology at launch infrastructure.', 'Choose your target market and operating model, define your brand, then configure the platform, payments, KYC, liquidity and client acquisition. Quadcode provides the technology and launch infrastructure.'],
  ['Gaano kabilis ako makakapag-launch?', 'How fast can I launch a Forex brokerage firm?'],
  ['Puwedeng mag-launch ang standard setup sa loob ng 14 days. Depende ang timeline sa configuration, integrations, at requirements ng market mo.', 'A standard setup can be launch-ready from 14 days. Timing depends on configuration, integrations and the requirements of your target market.'],
  ['Puwede ko bang gamitin ang sarili kong brand?', 'Can I launch under my own brand?'],
  ['Oo. Logo, domain, interface, at buong client experience—lahat nasa ilalim ng brand mo.', 'Yes. Your logo, domain, interface and client experience can all run under your own brokerage brand.'],
  ['Ano na ang kasama sa setup?', 'What is included in the white label brokerage solution?'],
  ['Kasama na ang trading platform, web at mobile apps, CRM, payments, risk management, dealing infrastructure, at launch support.', 'The setup includes a trading platform, web and mobile apps, CRM and back office, payments, risk management, dealing infrastructure and launch support.'],
  ['Kailangan ko ba ng technical team?', 'Do I need a technical team to start a brokerage company?'],
  ['Hindi. Quadcode ang bahala sa technical core para makapag-focus ang team mo sa client acquisition at growth.', 'No. Quadcode operates the technical core so your team can focus on client acquisition, operations and growth.'],
  ['Magkano ang kailangan?', 'What does it cost to start a Forex broker?'],
  ['Depende sa market, product setup, at operating model mo. Mag-request ng demo para makatanggap ng malinaw na launch plan at commercial proposal.', 'Cost depends on your target market, product configuration and operating model. Request a demo to receive a tailored launch plan and commercial proposal.'],
  ['© 2026 Quadcode. Lahat ng karapatan ay nakalaan.', '© 2026 Quadcode. All rights reserved.'],
  ['aria-label="Isara ang form"', 'aria-label="Close form"'],
  ['<h2 id="request-modal-title">Simulan ang Brokerage Mo</h2>', '<h2 id="request-modal-title">Start Your Forex Brokerage</h2>'],
  ['Ikuwento ang target market mo. Tutulungan ka naming piliin ang tamang setup.', 'Tell us about your target market. We will help you choose the right brokerage setup.'],
  ['>Buong pangalan*<', '>Full name*<'],
  ['placeholder="Ilagay ang buong pangalan"', 'placeholder="Enter your full name"'],
  ['placeholder="Ilagay ang email address" required', 'placeholder="Enter your work email" autocomplete="email" required'],
  ['>Numero ng telepono*<', '>Phone number*<'],
  ['data-phone-iso="PH"', 'data-phone-iso="US"'],
  ['aria-label="Piliin ang country code"', 'aria-label="Choose country calling code"'],
  ['<span data-phone-flag aria-hidden="true">🇵🇭</span>', '<span data-phone-flag aria-hidden="true">🇺🇸</span>'],
  ['<span data-phone-dial>+63</span>', '<span data-phone-dial>+1</span>'],
  ['aria-label="Mga country calling code"', 'aria-label="Country calling codes"'],
  ['placeholder="917 123 4567"', 'placeholder="202 555 0147"'],
  ['title="Maglagay ng valid na numero"', 'title="Enter a valid phone number"'],
  ['>Paunang investment<', '>Initial investment<'],
  ['placeholder="hal. US$100,000"', 'placeholder="e.g. US$100,000"'],
  ['>Bakit gusto mong mag-launch ng brokerage, at ano ang current business mo?*<', '>Why do you want to start a brokerage, and what is your current business?*<'],
  ['placeholder="Ikuwento nang maikli ang goal at current business mo"', 'placeholder="Briefly describe your launch goal and current business"'],
  ['Nabasa ko at sumasang-ayon ako sa ', 'I have read and agree to the '],
  ['terms and conditions</a> at ', 'terms and conditions</a> and '],
  ['privacy policy</a> ng website na ito.', 'privacy policy</a> of this website.'],
  ['aria-label="Pag-verify na hindi robot"', 'aria-label="Robot verification"'],
  ['>Kausapin Kami<', '>Talk to Us<'],
  ["'Kausapin Kami'", "'Talk to Us'"],
  ['Sa pagpapatuloy, sumasang-ayon ka sa aming Terms &amp; Conditions at Privacy Policy.', 'By continuing, you agree to our Terms &amp; Conditions and Privacy Policy.'],
  ['Brokerage mo. Hindi mo kailangang bumuo ng infrastructure mula zero.', 'Your brokerage. Without building the infrastructure from scratch.'],
  ['Mag-launch sa brand mo—connected na ang platform, apps, payments, CRM, at operations.', 'Launch under your brand with platform, apps, payments, CRM and operations connected.'],
  ['Gawa ng team na nagpapatakbo ng brokerage technology', 'Built by a team that operates brokerage technology'],
  ['Makakuha ng practical na setup plan, timeline, at commercial model.', 'Get a practical setup plan, timeline and commercial model.'],
  ['Natanggap na ang request mo', 'Your request has been received'],
  ['Makikipag-ugnayan ang team namin para planuhin ang launch ng brokerage mo.', 'Our team will contact you to map out your brokerage launch.'],
  ['>Tapos<', '>Done<'],
  ['hl=fil&onload', 'hl=en&onload'],
  ['Hindi ma-load ang security check. Pakisubukan ulit.', 'The security check could not load. Please try again.'],
  ['Pakikumpirma na hindi ka robot.', 'Please confirm that you are not a robot.'],
  ['Ipinapadala…', 'Sending…'],
  ['Hindi maipadala ang request mo. Pakicheck ang details at subukan ulit.', 'We could not send your request. Check the details and try again.'],
  ['Hindi maipadala ang request mo. Pakisubukan ulit.', 'We could not send your request. Please try again.'],
  ["document.querySelector('[data-phone-option][data-iso=\"PH\"]')?.click();", "document.querySelector('[data-phone-option][data-iso=\"US\"]')?.click();"],
];

for (const [from, to] of replacements) {
  if (!html.includes(from)) {
    throw new Error(`Template text not found: ${from.slice(0, 100)}`);
  }
  html = html.replaceAll(from, to);
}

html = html.replace(
  /    <link rel="alternate" hreflang="id"[\s\S]*?    <link rel="alternate" hreflang="x-default"[^\n]+\n/,
  '    <link rel="alternate" hreflang="en" href="https://quadcode.com/vlp/start-brokerage/" />\n' +
    '    <link rel="alternate" hreflang="x-default" href="https://quadcode.com/vlp/start-brokerage/" />\n',
);

html = html.replace(/    <meta property="og:locale:alternate"[^\n]+\n/g, "");

const structuredData = `
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            "name": "Quadcode White Label Forex Brokerage Solution",
            "provider": { "@type": "Organization", "name": "Quadcode" },
            "serviceType": "White label Forex brokerage platform",
            "url": "https://quadcode.com/vlp/start-brokerage/",
            "description": "A ready-to-run trading platform, CRM, payments, dealing and risk infrastructure for launching a Forex brokerage under your own brand."
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I start a Forex brokerage?",
                "acceptedAnswer": { "@type": "Answer", "text": "Choose your target market and operating model, define your brand, then configure the platform, payments, KYC, liquidity and client acquisition. Quadcode provides the technology and launch infrastructure." }
              },
              {
                "@type": "Question",
                "name": "How fast can I launch a Forex brokerage firm?",
                "acceptedAnswer": { "@type": "Answer", "text": "A standard setup can be launch-ready from 14 days. Timing depends on configuration, integrations and the requirements of your target market." }
              },
              {
                "@type": "Question",
                "name": "What is included in the white label brokerage solution?",
                "acceptedAnswer": { "@type": "Answer", "text": "The setup includes a trading platform, web and mobile apps, CRM and back office, payments, risk management, dealing infrastructure and launch support." }
              },
              {
                "@type": "Question",
                "name": "What does it cost to start a Forex broker?",
                "acceptedAnswer": { "@type": "Answer", "text": "Cost depends on your target market, product configuration and operating model. Request a demo to receive a tailored launch plan and commercial proposal." }
              }
            ]
          }
        ]
      }
    </script>
`;

html = html.replace("\n\n\n    <style>", `${structuredData}\n    <style>`);

const unifiedPageStyles = `
      @font-face {
        font-family: "Suisse Intl";
        src: url("./assets/fonts/SuisseIntl-Regular.woff") format("woff");
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: "Suisse Intl";
        src: url("./assets/fonts/SuisseIntl-Medium.woff") format("woff");
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }
      body,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      a,
      button,
      input,
      select,
      textarea,
      label,
      summary {
        font-family: "Suisse Intl", Arial, sans-serif;
      }
      body { font-weight: 400; letter-spacing: 0; }
      .hero-grow__headline,
      .section-title {
        font-weight: 400;
        letter-spacing: 0;
        line-height: 1.08;
      }
      body .hero.hero--grow .hero-grow__headline {
        font-weight: 400;
        letter-spacing: 0;
        line-height: 1;
      }
      .bento-card h3,
      .feat-bento__title,
      .faq summary,
      .btn {
        font-weight: 500;
      }
      .feat-bento .feat-bento__title {
        letter-spacing: 0;
        line-height: 1.2;
      }
      #features.platform {
        background: #161618;
      }
      #features .feat-bento--solid {
        background: linear-gradient(170deg, #28282c 0%, #1d1d20 100%);
        border-color: rgba(255, 255, 255, 0.08);
      }
      #features .feat-bento--light {
        background: #f3f3f4;
        border-color: rgba(20, 20, 20, 0.06);
      }
      #features .feat-bento--accent {
        background: linear-gradient(150deg, #f5f5f6 0%, #e9e9eb 100%);
        border-color: rgba(230, 35, 52, 0.08);
      }
      #features .feat-bento__device-tag {
        color: #63666b;
        background: #e5e5e7;
      }
`;

const platformShowcaseStyles = `
      /* Original Quadcode platform showcase, adapted from quadcode.com. */
      .platform-showcase {
        color: #f9fbfc;
        background: #161618;
        padding: 120px 0;
        overflow: hidden;
      }
      .platform-showcase__container {
        width: min(1328px, calc(100% - 64px));
        margin: 0 auto;
      }
      .platform-showcase__header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 377px;
        margin-bottom: 55px;
      }
      .platform-showcase__title {
        max-width: 77%;
        margin: 0 0 20px;
        color: transparent;
        background: linear-gradient(180deg, #f9fbfc 0%, #adb1b7 100%);
        -webkit-background-clip: text;
        background-clip: text;
        font-size: 64px;
        font-weight: 400;
        letter-spacing: 0;
        line-height: 72px;
      }
      .platform-showcase__subtitle {
        max-width: 90%;
        margin: 0;
        color: #adb1b7;
        font-size: 16px;
        line-height: 24px;
      }
      .platform-showcase__summary {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-top: 32px;
      }
      .platform-showcase__summary-label {
        max-width: 190px;
        color: #f9fbfc;
        font-size: 16px;
        line-height: 20px;
      }
      .platform-showcase__numbers {
        display: flex;
        justify-content: space-between;
        gap: 20px;
      }
      .platform-showcase__number strong {
        display: block;
        color: transparent;
        background: linear-gradient(180deg, #ff564b 0%, #ff282b 100%);
        -webkit-background-clip: text;
        background-clip: text;
        font-size: 46px;
        font-weight: 500;
        line-height: 1;
      }
      .platform-showcase__number span {
        display: block;
        margin-top: 5px;
        color: #7d8387;
        font-size: 17px;
        line-height: 1.2;
      }
      .platform-showcase__slider {
        display: grid;
        grid-template-columns: 150px minmax(0, 1fr);
        gap: 20px;
      }
      .platform-showcase__controls {
        display: grid;
        grid-template-rows: repeat(4, 1fr);
        gap: 12px;
        min-width: 0;
        height: 667px;
      }
      .platform-showcase__control {
        position: relative;
        display: flex;
        min-width: 0;
        padding: 0;
        cursor: pointer;
        color: #f9fbfc;
        background: #28282c;
        border: 0;
        border-radius: 28px;
        overflow: hidden;
        transition: outline-color 180ms ease, transform 180ms ease;
      }
      .platform-showcase__control::before {
        position: absolute;
        z-index: 2;
        inset: 0;
        content: "";
        pointer-events: none;
        border: 1px solid rgba(249, 251, 252, 0.18);
        border-radius: inherit;
      }
      .platform-showcase__control::after {
        position: absolute;
        z-index: 1;
        right: 0;
        bottom: 0;
        left: 0;
        height: 50px;
        content: "";
        pointer-events: none;
        background: linear-gradient(0deg, #161618 0%, rgba(22, 22, 24, 0) 100%);
      }
      .platform-showcase__control:hover {
        transform: translateY(-2px);
      }
      .platform-showcase__control[aria-selected="true"] {
        outline: 3px solid #ff282b;
        outline-offset: -3px;
      }
      .platform-showcase__control:focus-visible {
        outline: 3px solid #ff6b70;
        outline-offset: 3px;
      }
      .platform-showcase__control > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
      }
      .platform-showcase__control-label {
        position: absolute;
        z-index: 3;
        bottom: 12px;
        left: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
      }
      .platform-showcase__control-label img {
        width: 15px;
        height: 15px;
        filter: brightness(0) invert(1);
      }
      .platform-showcase__stage {
        position: relative;
        height: 667px;
        background: #28282c;
        border-radius: 40px;
        overflow: hidden;
      }
      .platform-showcase__panel {
        position: absolute;
        inset: 0;
        overflow: hidden;
        animation: platform-showcase-in 320ms cubic-bezier(.22, 1, .36, 1) both;
      }
      .platform-showcase__panel[hidden] { display: none; }
      .platform-showcase__panel > img {
        position: absolute;
        display: block;
        max-width: none;
        height: auto;
        filter: drop-shadow(0 24px 44px rgba(0, 0, 0, 0.24));
      }
      .platform-showcase__panel--pwa > img {
        bottom: -22%;
        left: 50%;
        width: min(49%, 470px);
        transform: translateX(-50%);
      }
      .platform-showcase__panel--mobile .platform-showcase__mobile-portrait {
        bottom: -10%;
        left: 8%;
        width: 37%;
      }
      .platform-showcase__panel--mobile .platform-showcase__mobile-landscape {
        right: 5%;
        bottom: 7%;
        width: 62%;
      }
      .platform-showcase__panel--desktop > img {
        right: 3%;
        bottom: -5%;
        width: 94%;
      }
      .platform-showcase__panel--browser > img {
        right: 3%;
        bottom: 6%;
        width: 94%;
      }
      .platform-showcase__detail {
        grid-column: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 56px;
        margin-top: 12px;
        color: #adb1b7;
      }
      .platform-showcase__detail-copy {
        flex: 1;
      }
      .platform-showcase__detail-copy strong {
        display: block;
        color: transparent;
        background: linear-gradient(180deg, #f9fbfc 0%, #adb1b7 100%);
        -webkit-background-clip: text;
        background-clip: text;
        font-size: 36px;
        font-weight: 400;
        line-height: 40px;
      }
      .platform-showcase__detail-platforms {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-height: 56px;
      }
      .platform-showcase__detail-label,
      .platform-showcase__detail-item {
        display: flex;
        align-items: center;
        min-height: 56px;
        font-size: 16px;
        line-height: 20px;
      }
      .platform-showcase__detail-label {
        width: 128px;
        padding-right: 32px;
        color: #7d8387;
      }
      .platform-showcase__detail-item {
        gap: 12px;
        min-width: 158px;
        padding: 0 24px;
        color: #fff;
        border-left: 1px solid #353539;
      }
      .platform-showcase__detail-item:last-child { padding-right: 0; }
      .platform-showcase__detail-item img {
        flex: 0 0 auto;
        width: 48px;
        height: 48px;
        object-fit: contain;
      }
      .platform-showcase__detail-item--system img {
        border-radius: 50%;
        background: rgba(249, 251, 252, 0.1);
      }
      .platform-showcase__detail-item--browser {
        min-width: auto;
        padding: 0 6px;
        border-left: 0;
      }
      .platform-showcase__detail-item--browser:first-child { padding-left: 0; }
      .platform-showcase__detail-item--browser:last-child { padding-right: 0; }
      .platform-showcase__detail-item--browser img {
        width: 48px;
        height: 48px;
      }
      .platform-showcase__platform-name {
        display: flex;
        flex-direction: column;
        color: #fff;
        line-height: 20px;
      }
      .platform-showcase__platform-name small {
        color: #7d8387;
        font: inherit;
      }
      @keyframes platform-showcase-in {
        from { opacity: 0; transform: translateY(10px) scale(.995); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (max-width: 1365px) {
        .platform-showcase__title {
          max-width: 80%;
          font-size: 56px;
          line-height: 68px;
        }
        .platform-showcase__subtitle { max-width: 80%; }
        .platform-showcase__slider { grid-template-columns: 120px minmax(0, 1fr); }
        .platform-showcase__controls,
        .platform-showcase__stage { height: 511px; }
        .platform-showcase__detail { grid-column: 1 / -1; }
        .platform-showcase__detail-copy strong { font-size: 32px; line-height: 36px; }
      }
      @media (max-width: 1023px) {
        .platform-showcase__container { width: min(100% - 64px, 960px); }
        .platform-showcase__header { grid-template-columns: 1fr; }
        .platform-showcase__title { max-width: 100%; font-size: 52px; line-height: 64px; }
        .platform-showcase__subtitle { max-width: 100%; }
        .platform-showcase__summary { gap: 32px; padding-top: 0; }
        .platform-showcase__summary-label { max-width: none; font-size: 14px; }
        .platform-showcase__numbers { max-width: 520px; }
        .platform-showcase__slider { grid-template-columns: 98px minmax(0, 1fr); }
        .platform-showcase__controls,
        .platform-showcase__stage { height: 414px; }
        .platform-showcase__control { border-radius: 22px; }
        .platform-showcase__detail-copy strong { max-width: 210px; font-size: 28px; line-height: 28px; }
        .platform-showcase__detail-label,
        .platform-showcase__detail-item { font-size: 14px; }
        .platform-showcase__detail-item { min-width: 136px; padding: 0 16px; }
        .platform-showcase__detail-item img { width: 40px; height: 40px; }
      }
      @media (max-width: 719px) {
        .platform-showcase__container { width: min(100% - 48px, 660px); }
        .platform-showcase__header { margin-bottom: 43px; }
        .platform-showcase__title { margin-bottom: 20px; font-size: 52px; line-height: 64px; }
        .platform-showcase__summary-label { font-size: 15px; }
        .platform-showcase__number strong { font-size: 36px; }
        .platform-showcase__number span { font-size: 14px; }
        .platform-showcase__slider { grid-template-columns: 1fr; }
        .platform-showcase__stage { grid-row: 1; height: 414px; border-radius: 28px; }
        .platform-showcase__controls {
          grid-row: 2;
          grid-template-rows: none;
          grid-template-columns: repeat(4, 102px);
          height: 102px;
          padding: 3px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .platform-showcase__controls::-webkit-scrollbar { display: none; }
        .platform-showcase__control { border-radius: 20px; }
        .platform-showcase__control-label { bottom: 10px; left: 10px; }
        .platform-showcase__panel--pwa > img { bottom: -8%; width: min(68%, 310px); }
        .platform-showcase__panel--mobile .platform-showcase__mobile-portrait { bottom: -2%; left: 3%; width: 49%; }
        .platform-showcase__panel--mobile .platform-showcase__mobile-landscape { right: -5%; bottom: 13%; width: 70%; }
        .platform-showcase__panel--desktop > img { right: -12%; bottom: 3%; width: 126%; }
        .platform-showcase__panel--browser > img { right: -14%; bottom: 12%; width: 132%; }
        .platform-showcase__detail {
          grid-column: 1;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 32px;
          min-height: 116px;
          margin: 12px 0 24px;
        }
        .platform-showcase__detail-copy { flex: 0; }
        .platform-showcase__detail-copy strong { max-width: 100%; }
        .platform-showcase__detail-platforms { width: 100%; min-height: 48px; justify-content: flex-start; }
        .platform-showcase__detail-label { flex: 1; width: auto; min-height: 48px; padding-right: 12px; }
        .platform-showcase__detail-item { flex: 1; min-width: 0; min-height: 48px; padding: 0 10px; }
        .platform-showcase__detail-item--browser { flex: 0 0 auto; padding: 0 5px; }
      }
      @media (max-width: 479px) {
        .platform-showcase { padding: 88px 0; }
        .platform-showcase__container { width: calc(100% - 40px); }
        .platform-showcase__title { font-size: 36px; line-height: 44px; }
        .platform-showcase__numbers { gap: 12px; }
        .platform-showcase__number strong { font-size: 31px; }
        .platform-showcase__number span { font-size: 12px; }
        .platform-showcase__detail-copy strong { font-size: 22px; line-height: 26px; }
        .platform-showcase__detail-label,
        .platform-showcase__detail-item { font-size: 13px; line-height: 18px; }
        .platform-showcase__detail-item { gap: 8px; padding: 0 8px; }
        .platform-showcase__detail-item img,
        .platform-showcase__detail-item--browser img { width: 40px; height: 40px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .platform-showcase__control { transition: none; }
        .platform-showcase__panel { animation: none; }
      }
`;

const kickstartStyles = `
      /* Original Quadcode Kickstart structure, adapted from quadcode.com. */
      .kickstart {
        color: #f9fbfc;
        background: #161618;
        padding: 120px 0;
        overflow: hidden;
      }
      .kickstart__container {
        width: min(1328px, calc(100% - 64px));
        margin: 0 auto;
      }
      .kickstart__content {
        display: flex;
        align-items: flex-start;
        gap: 96px;
      }
      .kickstart__title {
        flex: 1;
        max-width: 804px;
        margin: 0;
        color: transparent;
        background: linear-gradient(180deg, #f9fbfc 0%, #adb1b7 100%);
        -webkit-background-clip: text;
        background-clip: text;
        font-size: 64px;
        font-weight: 400;
        line-height: 72px;
      }
      .kickstart__right {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 31px;
        max-width: 424px;
      }
      .kickstart__description {
        margin: 0;
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        line-height: 24px;
      }
      .kickstart__cta {
        align-self: flex-start;
        width: fit-content;
        height: 36px;
        padding: 8px 16px;
        border-radius: 40px;
        box-shadow: none;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
      }
      .kickstart__visual {
        position: relative;
        display: flex;
        justify-content: center;
        gap: 32px;
        height: 388px;
        margin-top: 58px;
        padding: 56px 56px 0;
        background: #28282c;
        border-radius: 32px;
        overflow: hidden;
      }
      .kickstart__image {
        align-self: flex-end;
        max-width: 100%;
        height: auto;
        margin-top: auto;
        object-fit: contain;
        object-position: center bottom;
      }
      .kickstart__image--desktop { flex: 1; max-width: 80%; }
      .kickstart__image--mobile { max-width: 270px; }
      .kickstart__steps-wrap {
        margin-top: 58px;
        overflow: visible;
      }
      .kickstart__steps {
        display: flex;
        gap: 20px;
        width: 100%;
        min-height: 184px;
        margin: 0;
        padding: 0 0 60px;
        list-style: none;
      }
      .kickstart__step-item {
        display: flex;
        flex: 1;
        min-width: 0;
        transition: flex 300ms ease, width 300ms ease;
      }
      .kickstart__step-item.is-active {
        flex: 0 0 427px;
        width: 427px;
      }
      .kickstart__step {
        position: relative;
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        min-width: 0;
        padding: 24px 0 16px;
        color: inherit;
        text-align: left;
        background: transparent;
        border: 0;
        cursor: pointer;
      }
      .kickstart__step:focus-visible {
        outline: 2px solid #ff6b70;
        outline-offset: 6px;
      }
      .kickstart__step-line {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }
      .kickstart__step-progress {
        display: block;
        width: 0;
        height: 100%;
        background: #e62334;
      }
      .kickstart__step-item.is-active .kickstart__step-progress {
        animation: kickstart-progress 5s linear forwards;
      }
      .kickstart__step-number {
        color: rgba(255, 255, 255, 0.6);
        font-size: 16px;
        line-height: 20px;
      }
      .kickstart__step-title {
        color: #f9fbfc;
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
      }
      .kickstart__step-description {
        position: absolute;
        top: 100%;
        left: 0;
        max-width: 427px;
        margin: 0;
        color: #7d8387;
        font-size: 16px;
        line-height: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 300ms ease;
      }
      .kickstart__step-item.is-active .kickstart__step-description { opacity: 1; }
      @keyframes kickstart-progress { from { width: 0; } to { width: 100%; } }
      @media (max-width: 1365px) {
        .kickstart__title { font-size: 56px; line-height: 68px; }
        .kickstart__image--desktop {
          flex: 0 0 594px;
          width: 594px;
          max-width: 594px;
        }
      }
      @media (max-width: 1023px) {
        .kickstart { padding-bottom: 40px; }
        .kickstart__content { gap: 48px; }
        .kickstart__title { max-width: 540px; font-size: 52px; line-height: 64px; }
        .kickstart__step-item.is-active { flex-basis: 360px; width: 360px; }
      }
      @media (max-width: 720px) {
        .kickstart__container { width: min(100% - 48px, 660px); }
        .kickstart__content { flex-direction: column; gap: 24px; }
        .kickstart__right { max-width: 540px; }
        .kickstart__visual {
          justify-content: flex-start;
          gap: 16px;
          height: 364px;
          padding: 32px 0 0 24px;
        }
        .kickstart__image--desktop {
          order: 2;
          flex: 0 0 auto;
          width: 800px;
          max-width: none;
          object-fit: cover;
          object-position: left center;
        }
        .kickstart__image--mobile {
          order: 1;
          width: 176px;
          max-width: 176px;
          object-fit: cover;
        }
        .kickstart__steps-wrap {
          margin-right: calc((100vw - 100%) / -2);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .kickstart__steps-wrap::-webkit-scrollbar { display: none; }
        .kickstart__steps {
          width: max-content;
          min-height: 200px;
          padding-bottom: 80px;
        }
        .kickstart__step-item { flex: 0 0 96px; width: 96px; }
        .kickstart__step-item.is-active { flex-basis: 234px; width: 234px; }
        .kickstart__step { gap: 12px; padding: 16px 0 12px; }
        .kickstart__step-title { display: none; font-size: 14px; line-height: 20px; }
        .kickstart__step-item.is-active .kickstart__step-title { display: block; }
      }
      @media (max-width: 480px) {
        .kickstart__container { width: calc(100% - 40px); }
        .kickstart__title { font-size: 36px; line-height: 44px; }
        .kickstart__visual { height: 308px; }
        .kickstart__image--desktop { width: 480px; max-width: 480px; }
        .kickstart__image--mobile { width: 160px; max-width: 160px; }
        .kickstart__step-item { flex-basis: 72px; width: 72px; }
        .kickstart__step-item.is-active { flex-basis: 168px; width: 168px; }
        .kickstart__step-description { font-size: 14px; }
      }
      @media (max-width: 393px) {
        .kickstart { padding: 90px 0 40px; }
        .kickstart__visual {
          gap: 8px;
          height: 208px;
          padding: 32px 0 0 24px;
          border-radius: 16px;
        }
        .kickstart__image--desktop { width: 440px; max-width: 440px; }
        .kickstart__image--mobile { width: 106px; height: 223px; max-width: 106px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .kickstart__step-item,
        .kickstart__step-description { transition: none; }
        .kickstart__step-item.is-active .kickstart__step-progress { width: 100%; animation: none; }
      }
`;

const platformShowcaseMarkup = `
      <section id="platform-showcase" class="platform-showcase reveal" aria-labelledby="platform-showcase-title">
        <div class="platform-showcase__container">
          <div class="platform-showcase__header">
            <div>
              <h2 id="platform-showcase-title" class="platform-showcase__title">Build Your Custom Brokerage Brand</h2>
              <p class="platform-showcase__subtitle">Give your traders a seamless experience with a fully customizable white label trading platform across web, desktop and mobile.</p>
            </div>
            <div class="platform-showcase__summary">
              <p class="platform-showcase__summary-label">All the popular assets your traders need</p>
              <div class="platform-showcase__numbers" aria-label="Platform coverage">
                <div class="platform-showcase__number"><strong>6</strong><span>Markets</span></div>
                <div class="platform-showcase__number"><strong>700+</strong><span>Instruments</span></div>
                <div class="platform-showcase__number"><strong>100+</strong><span>Indicators</span></div>
              </div>
            </div>
          </div>

          <div class="platform-showcase__slider" data-platform-showcase>
            <div class="platform-showcase__controls" role="tablist" aria-label="Trading platform interfaces">
              <button class="platform-showcase__control" id="platform-tab-pwa" type="button" role="tab" aria-selected="true" aria-controls="platform-panel-pwa" data-platform-tab="pwa">
                <img src="./assets/platform-showcase/slide1-thumb.webp" alt="" width="208" height="268" loading="lazy" decoding="async" />
                <span class="platform-showcase__control-label"><img src="./assets/platform-showcase/browser.svg" alt="" />PWA</span>
              </button>
              <button class="platform-showcase__control" id="platform-tab-mobile" type="button" role="tab" aria-selected="false" aria-controls="platform-panel-mobile" tabindex="-1" data-platform-tab="mobile">
                <img src="./assets/platform-showcase/slide2-thumb.webp" alt="" width="208" height="268" loading="lazy" decoding="async" />
                <span class="platform-showcase__control-label"><img src="./assets/platform-showcase/apple.svg" alt="" />Mobile</span>
              </button>
              <button class="platform-showcase__control" id="platform-tab-desktop" type="button" role="tab" aria-selected="false" aria-controls="platform-panel-desktop" tabindex="-1" data-platform-tab="desktop">
                <img src="./assets/platform-showcase/slide3-thumb.webp" alt="" width="300" height="300" loading="lazy" decoding="async" />
                <span class="platform-showcase__control-label"><img src="./assets/platform-showcase/windows.svg" alt="" />Desktop</span>
              </button>
              <button class="platform-showcase__control" id="platform-tab-browser" type="button" role="tab" aria-selected="false" aria-controls="platform-panel-browser" tabindex="-1" data-platform-tab="browser">
                <img src="./assets/platform-showcase/slide4-thumb.webp" alt="" width="268" height="274" loading="lazy" decoding="async" />
                <span class="platform-showcase__control-label"><img src="./assets/platform-showcase/browser.svg" alt="" />Browser</span>
              </button>
            </div>

            <div class="platform-showcase__stage">
              <div class="platform-showcase__panel platform-showcase__panel--pwa" id="platform-panel-pwa" role="tabpanel" aria-labelledby="platform-tab-pwa" data-platform-panel="pwa">
                <img src="./assets/platform-showcase/slide1.webp" alt="Quadcode PWA trading platform interface" width="802" height="1264" loading="lazy" decoding="async" />
              </div>
              <div class="platform-showcase__panel platform-showcase__panel--mobile" id="platform-panel-mobile" role="tabpanel" aria-labelledby="platform-tab-mobile" data-platform-panel="mobile" hidden>
                <img class="platform-showcase__mobile-portrait" src="./assets/platform-showcase/slide2-portrait.webp" alt="Quadcode mobile trading app in portrait view" width="864" height="1210" loading="lazy" decoding="async" />
                <img class="platform-showcase__mobile-landscape" src="./assets/platform-showcase/slide2-landscape.webp" alt="Quadcode mobile trading app in landscape view" width="1187" height="873" loading="lazy" decoding="async" />
              </div>
              <div class="platform-showcase__panel platform-showcase__panel--desktop" id="platform-panel-desktop" role="tabpanel" aria-labelledby="platform-tab-desktop" data-platform-panel="desktop" hidden>
                <img src="./assets/platform-showcase/slide3.webp" alt="Quadcode desktop trading platform interface" width="2661" height="1935" loading="lazy" decoding="async" />
              </div>
              <div class="platform-showcase__panel platform-showcase__panel--browser" id="platform-panel-browser" role="tabpanel" aria-labelledby="platform-tab-browser" data-platform-panel="browser" hidden>
                <img src="./assets/platform-showcase/slide4.webp" alt="Quadcode browser trading platform interface" width="2080" height="1254" loading="lazy" decoding="async" />
              </div>
            </div>

            <div class="platform-showcase__detail" aria-live="polite">
              <div class="platform-showcase__detail-copy">
                <strong data-platform-detail-title>PWA</strong>
              </div>
              <div class="platform-showcase__detail-platforms" data-platform-detail-content>
                <span class="platform-showcase__detail-label">No need to download app</span>
                <span class="platform-showcase__detail-item platform-showcase__detail-item--system">
                  <img src="./assets/platform-showcase/browser.svg" alt="" />
                  <span>Instant mobile app</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>`;

const platformShowcaseScript = `
    <script>
      (function setupPlatformShowcase() {
        const root = document.querySelector('[data-platform-showcase]');
        if (!root) return;

        const tabs = Array.from(root.querySelectorAll('[data-platform-tab]'));
        const panels = Array.from(root.querySelectorAll('[data-platform-panel]'));
        const detailTitle = root.querySelector('[data-platform-detail-title]');
        const detailContent = root.querySelector('[data-platform-detail-content]');
        const details = {
          pwa: {
            title: 'PWA',
            content: '<span class="platform-showcase__detail-label">No need to download app</span><span class="platform-showcase__detail-item platform-showcase__detail-item--system"><img src="./assets/platform-showcase/browser.svg" alt=""><span>Instant mobile app</span></span>'
          },
          mobile: {
            title: 'Mobile apps',
            content: '<span class="platform-showcase__detail-label">Available platforms</span><span class="platform-showcase__detail-item platform-showcase__detail-item--system"><img src="./assets/platform-showcase/mobile-android.svg" alt=""><span>Android</span></span><span class="platform-showcase__detail-item platform-showcase__detail-item--system"><img src="./assets/platform-showcase/mobile-ios.svg" alt=""><span>iOS</span></span>'
          },
          desktop: {
            title: 'Standalone apps',
            content: '<span class="platform-showcase__detail-label">Available platforms</span><span class="platform-showcase__detail-item"><img src="./assets/platform-showcase/windows-app.svg" alt=""><span class="platform-showcase__platform-name"><span>Windows</span><small>.msi</small></span></span><span class="platform-showcase__detail-item"><img src="./assets/platform-showcase/macos-app-store.webp" alt=""><span class="platform-showcase__platform-name"><span>MacOS</span><small>.dmg</small></span></span>'
          },
          browser: {
            title: 'Any browser',
            content: '<span class="platform-showcase__detail-item platform-showcase__detail-item--browser"><img src="./assets/platform-showcase/chrome.webp" alt="Chrome"></span><span class="platform-showcase__detail-item platform-showcase__detail-item--browser"><img src="./assets/platform-showcase/safari.webp" alt="Safari"></span><span class="platform-showcase__detail-item platform-showcase__detail-item--browser"><img src="./assets/platform-showcase/edge.webp" alt="Microsoft Edge"></span><span class="platform-showcase__detail-item platform-showcase__detail-item--browser"><img src="./assets/platform-showcase/firefox.webp" alt="Firefox"></span>'
          }
        };

        const activate = (key, moveFocus) => {
          tabs.forEach((tab) => {
            const active = tab.dataset.platformTab === key;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            if (active && moveFocus) tab.focus();
          });
          panels.forEach((panel) => {
            panel.hidden = panel.dataset.platformPanel !== key;
          });

          const detail = details[key];
          if (!detail) return;
          detailTitle.textContent = detail.title;
          detailContent.innerHTML = detail.content;
        };

        tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => activate(tab.dataset.platformTab, false));
          tab.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            let nextIndex = index;
            if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = tabs.length - 1;
            else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
            else nextIndex = (index - 1 + tabs.length) % tabs.length;
            activate(tabs[nextIndex].dataset.platformTab, true);
          });
        });
      })();
    </script>`;

const kickstartMarkup = `
      <section id="how-it-works" class="kickstart reveal" aria-labelledby="kickstart-title">
        <div class="kickstart__container" data-kickstart>
          <div class="kickstart__content">
            <h2 id="kickstart-title" class="kickstart__title">Kickstart your broker within <span>14 days</span></h2>
            <div class="kickstart__right">
              <p class="kickstart__description">Fill out the form and chat with our managers to discuss your project and see how quickly you can set up your brokerage business.</p>
              <a class="btn btn--primary kickstart__cta" href="#request" data-open-modal>Request demo</a>
            </div>
          </div>

          <div class="kickstart__visual">
            <img class="kickstart__image kickstart__image--desktop" src="./assets/kickstart/desktop.webp" alt="Quadcode desktop trading platform" width="916" height="602" loading="lazy" decoding="async" />
            <img class="kickstart__image kickstart__image--mobile" src="./assets/kickstart/mobile.webp" alt="Quadcode mobile trading platform" width="273" height="575" loading="lazy" decoding="async" />
          </div>

          <div class="kickstart__steps-wrap" aria-label="Brokerage launch process">
            <ol class="kickstart__steps">
              <li class="kickstart__step-item is-active" data-kickstart-step>
                <button class="kickstart__step" type="button" aria-current="step">
                  <span class="kickstart__step-line" aria-hidden="true"><span class="kickstart__step-progress"></span></span>
                  <span class="kickstart__step-number">01.</span>
                  <span class="kickstart__step-title">Request demo</span>
                </button>
              </li>
              <li class="kickstart__step-item" data-kickstart-step>
                <button class="kickstart__step" type="button">
                  <span class="kickstart__step-line" aria-hidden="true"><span class="kickstart__step-progress"></span></span>
                  <span class="kickstart__step-number">02.</span>
                  <span class="kickstart__step-title">Check out the demo</span>
                  <span class="kickstart__step-description">Check out our demo to learn everything you need to know about the platform.</span>
                </button>
              </li>
              <li class="kickstart__step-item" data-kickstart-step>
                <button class="kickstart__step" type="button">
                  <span class="kickstart__step-line" aria-hidden="true"><span class="kickstart__step-progress"></span></span>
                  <span class="kickstart__step-number">03.</span>
                  <span class="kickstart__step-title">Customise the platform</span>
                </button>
              </li>
              <li class="kickstart__step-item" data-kickstart-step>
                <button class="kickstart__step" type="button">
                  <span class="kickstart__step-line" aria-hidden="true"><span class="kickstart__step-progress"></span></span>
                  <span class="kickstart__step-number">04.</span>
                  <span class="kickstart__step-title">Sign the contract</span>
                </button>
              </li>
              <li class="kickstart__step-item" data-kickstart-step>
                <button class="kickstart__step" type="button">
                  <span class="kickstart__step-line" aria-hidden="true"><span class="kickstart__step-progress"></span></span>
                  <span class="kickstart__step-number">05.</span>
                  <span class="kickstart__step-title">Get brokerage solution</span>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </section>`;

const kickstartScript = `
    <script>
      (function setupKickstartSteps() {
        const root = document.querySelector('[data-kickstart]');
        if (!root) return;

        const items = Array.from(root.querySelectorAll('[data-kickstart-step]'));
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let activeIndex = 0;
        let timer;

        const stopTimer = () => window.clearTimeout(timer);
        const startTimer = () => {
          stopTimer();
          if (prefersReducedMotion.matches || document.hidden) return;
          timer = window.setTimeout(() => activate((activeIndex + 1) % items.length, false), 5000);
        };

        const activate = (index, moveFocus) => {
          activeIndex = (index + items.length) % items.length;
          items.forEach((item, itemIndex) => {
            const active = itemIndex === activeIndex;
            item.classList.toggle('is-active', active);
            const button = item.querySelector('button');
            if (active) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
            if (active && moveFocus) button.focus();
          });
          startTimer();
        };

        items.forEach((item, index) => {
          const button = item.querySelector('button');
          button.addEventListener('click', () => activate(index, false));
          button.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'Home') activate(0, true);
            else if (event.key === 'End') activate(items.length - 1, true);
            else activate(index + (event.key === 'ArrowRight' ? 1 : -1), true);
          });
        });

        root.addEventListener('mouseenter', stopTimer);
        root.addEventListener('mouseleave', startTimer);
        root.addEventListener('focusin', stopTimer);
        root.addEventListener('focusout', startTimer);
        document.addEventListener('visibilitychange', startTimer);
        prefersReducedMotion.addEventListener?.('change', startTimer);
        startTimer();
      })();
    </script>`;

const calBookingUrl = "https://quadcode.cal.eu/quadcode-team/quadcode-meeting";
const calButtonAttributes = [
  `href="${calBookingUrl}"`,
  'data-cal-namespace="quadcode-meeting"',
  'data-cal-link="quadcode-team/quadcode-meeting"',
  'data-cal-origin="https://quadcode.cal.eu"',
  `data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'`,
].join(" ");

const calEmbedScript = `
    <script>
      (function setupCalBooking() {
        const namespace = 'quadcode-meeting';
        const calOrigin = 'https://quadcode.cal.eu';
        const calLink = 'quadcode-team/quadcode-meeting';
        const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        const query = new URLSearchParams(window.location.search);
        const config = {
          layout: 'month_view',
          useSlotsViewOnSmallScreen: 'true',
          'metadata[source_form]': 'quadcode_start_brokerage',
          'metadata[landing_path]': window.location.pathname,
          'metadata[source_url]': window.location.href.split('#')[0]
        };

        utmFields.forEach((field) => {
          const value = query.get(field);
          if (value) config['metadata[' + field + ']'] = value.slice(0, 180);
        });

        document.querySelectorAll('[data-cal-namespace="' + namespace + '"]').forEach((button) => {
          button.dataset.calConfig = JSON.stringify(config);
          button.addEventListener('click', function (event) {
            if (button.hasAttribute('data-cal-link')) event.preventDefault();
          });
        });

        (function (C, A, L) {
          const push = function (api, args) { api.q.push(args); };
          const documentRef = C.document;
          C.Cal = C.Cal || function () {
            const cal = C.Cal;
            const args = arguments;
            if (!cal.loaded) {
              cal.ns = {};
              cal.q = cal.q || [];
              const script = documentRef.createElement('script');
              script.src = A;
              script.async = true;
              script.onerror = function () {
                document.querySelectorAll('[data-cal-link="' + calLink + '"]').forEach((button) => {
                  button.removeAttribute('data-cal-link');
                });
              };
              documentRef.head.appendChild(script);
              cal.loaded = true;
            }
            if (args[0] === L) {
              const api = function () { push(api, arguments); };
              const currentNamespace = args[1];
              api.q = api.q || [];
              if (typeof currentNamespace === 'string') {
                cal.ns[currentNamespace] = cal.ns[currentNamespace] || api;
                push(cal.ns[currentNamespace], args);
                push(cal, ['initNamespace', currentNamespace]);
              } else {
                push(cal, args);
              }
              return;
            }
            push(cal, args);
          };
        })(window, calOrigin + '/embed/embed.js', 'init');

        window.Cal('init', namespace, { origin: calOrigin });
        window.Cal.config = window.Cal.config || {};
        window.Cal.config.forwardQueryParams = true;

        const cal = window.Cal.ns[namespace];
        cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
        cal('on', {
          action: 'bookerViewed',
          callback: function () {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'start_brokerage_cal_open' });
          }
        });
        cal('on', {
          action: 'bookingSuccessfulV2',
          callback: function (event) {
            const booking = event && event.detail ? event.detail.data || {} : {};
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'start_brokerage_cal_booking_success',
              cal_booking_uid: booking.uid || '',
              cal_event_type_id: booking.eventTypeId || '',
              cal_booking_start: booking.startTime || '',
              cal_booking_status: booking.status || ''
            });
          }
        });
      })();
    </script>`;

const styleCloseIndex = html.lastIndexOf("</style>");
if (styleCloseIndex < 0) throw new Error("Template style block not found");
const stylePrefix = html.slice(0, styleCloseIndex).replace(/[ \t]+$/, "");
html = stylePrefix + unifiedPageStyles + platformShowcaseStyles + kickstartStyles + html.slice(styleCloseIndex);

const stepsMarker = '      <section id="how-it-works" class="ga-steps reveal"';
const stepsStartIndex = html.indexOf(stepsMarker);
if (stepsStartIndex < 0) throw new Error("How-it-works section not found");
const stepsEndMarker = "\n      </section>";
const stepsEndIndex = html.indexOf(stepsEndMarker, stepsStartIndex);
if (stepsEndIndex < 0) throw new Error("How-it-works section end not found");
html = html.slice(0, stepsStartIndex) +
  platformShowcaseMarkup + "\n\n" + kickstartMarkup +
  html.slice(stepsEndIndex + stepsEndMarker.length);

const legacyCalCta = 'href="#request" data-open-modal';
const legacyCalCtaCount = html.split(legacyCalCta).length - 1;
if (legacyCalCtaCount < 1) throw new Error("Legacy request CTA not found");
html = html.replaceAll(legacyCalCta, calButtonAttributes);

const modalStartMarker = '    <div class="modal" id="request-modal"';
const modalStartIndex = html.indexOf(modalStartMarker);
if (modalStartIndex < 0) throw new Error("Legacy request modal not found");
const firstScriptAfterModal = html.indexOf("\n\n    <script>", modalStartIndex);
if (firstScriptAfterModal < 0) throw new Error("Script after legacy request modal not found");
html = html.slice(0, modalStartIndex) + html.slice(firstScriptAfterModal + 2);

html = html.replace(
  /      const openModalButtons = document\.querySelectorAll\('\[data-open-modal\]'\);[\s\S]*?      const recaptchaMount = document\.getElementById\('request-recaptcha'\);\n/,
  "",
);
html = html.replace("      let previouslyFocused = null;\n", "");
html = html.replace(
  /      let recaptchaWidgetId = null;\n      let recaptchaLoader = null;\n      let recaptchaPrepareTimer = 0;\n/,
  "",
);
html = html.replace(
  /\n      const recaptchaSiteKey = [\s\S]*?\n      const observer = new IntersectionObserver\(/,
  "\n      const observer = new IntersectionObserver(",
);
html = html.replace(
  /\n      const getFocusableElements = \(\) => \{[\s\S]*?\n      \/\* Ensure pv-stream rows are long enough for seamless infinite loop \*\//,
  "\n      /* Ensure pv-stream rows are long enough for seamless infinite loop */",
);

html = html.replace(
  /\n    <script type="module">\s*import \{ s as setupPhonePickers \}[\s\S]*?<\/script>/,
  "",
);

if (!html.includes("  </body>")) throw new Error("Template body closing tag not found");
html = html.replace("  </body>", `${platformShowcaseScript}\n${kickstartScript}\n${calEmbedScript}\n  </body>`);

await writeFile(outputPath, html);
console.log(`Built ${path.relative(process.cwd(), outputPath)} from ${path.relative(process.cwd(), templatePath)}`);
