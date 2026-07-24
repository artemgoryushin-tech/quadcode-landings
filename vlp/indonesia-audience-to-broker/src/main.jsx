/*
THESIS: Your ability to acquire traders and build an audience can become the foundation of a brokerage business you own.
OWN-WORLD: Quadcode red, black, white, Proxima Nova, generous space, one clear action, and no invented product imagery.
STORY: You already acquire traders → another broker controls the product and client relationship → build your own brand with Quadcode infrastructure → book a demo.
FIRST VIEWPORT: Direct promise and one CTA beside approved Quadcode brand footage.
FORM: A short Book a Demo form that qualifies the acquisition model without turning the page into an application process.
*/
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const appBase = import.meta.env.BASE_URL.replace(/\/$/, "");
const assetUrl = (path) => `${appBase}/${path.replace(/^\//, "")}`;
const privacyUrl = "https://quadcode.com/privacy-policy";
const utmFields = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const countries = [
  { code: "ID", dial: "+62" },
  { code: "SG", dial: "+65" },
  { code: "MY", dial: "+60" },
  { code: "PH", dial: "+63" },
  { code: "TH", dial: "+66" },
  { code: "VN", dial: "+84" }
];

const awards = [
  { image: assetUrl("assets/awards/01-best-white-label-brokerage-provider.webp"), title: "Best White Label Brokerage Provider" },
  { image: assetUrl("assets/awards/02-best-white-label-broker.webp"), title: "Best White Label Broker" },
  { image: assetUrl("assets/awards/03-best-white-label-solution-for-brokers.webp"), title: "Best White Label Solution for Brokers" },
  { image: assetUrl("assets/awards/04-best-provider-for-brokers.webp"), title: "Best Provider for Brokers" }
];

const orbitEntities = [
  { image: assetUrl("assets/orbit/Sales_module.png"), name: "Sales Module", ring: "outer", start: 0, width: 16.5 },
  { image: assetUrl("assets/orbit/mobile_app.png"), name: "Mobile Applications", ring: "outer", start: 60, width: 21.3 },
  { image: assetUrl("assets/orbit/Affiliate_System.png"), name: "Affiliate System", ring: "outer", start: 120, width: 20.3 },
  { image: assetUrl("assets/orbit/User_communication.png"), name: "User Communication", ring: "outer", start: 180, width: 22.5 },
  { image: assetUrl("assets/orbit/trading_platform.png"), name: "Trading Platform", ring: "outer", start: 240, width: 19 },
  { image: assetUrl("assets/orbit/Liquidity.png"), name: "Liquidity", ring: "outer", start: 300, width: 12.6 },
  { image: assetUrl("assets/orbit/Reports.png"), name: "Reports", ring: "inner", start: 18, width: 12.1 },
  { image: assetUrl("assets/orbit/KYC.png"), name: "KYC", ring: "inner", start: 90, width: 9.5 },
  { image: assetUrl("assets/orbit/Billing.png"), name: "Billing", ring: "inner", start: 162, width: 11.1 },
  { image: assetUrl("assets/orbit/Dealing.png"), name: "Dealing", ring: "inner", start: 234, width: 11.3 },
  { image: assetUrl("assets/orbit/AML.png"), name: "AML", ring: "inner", start: 306, width: 9.5 }
];

const featuredLogos = [
  { image: assetUrl("assets/featured/fxstreet.png"), name: "FXStreet" },
  { image: assetUrl("assets/featured/fxempire.png"), name: "FXEmpire" },
  { image: assetUrl("assets/featured/business-insider.png"), name: "Business Insider" },
  { image: assetUrl("assets/featured/business-wire.png"), name: "Business Wire" },
  { image: assetUrl("assets/featured/yahoo-finance.png"), name: "Yahoo Finance" }
];

const copy = {
  id: {
    meta: {
      title: "Ubah Kemampuan Menjangkau Trader Menjadi Brand Broker Anda | Quadcode",
      description: "Ubah audiens, jaringan, atau keahlian akuisisi Anda menjadi pengalaman trading dengan brand sendiri."
    },
    nav: { how: "Cara kerjanya", solution: "Solusi", faq: "FAQ", cta: "Jadwalkan demo" },
    hero: {
      eyebrow: "Untuk Anda yang sudah menjangkau trader: IB, akademi, komunitas, affiliate, dan tim akuisisi di Indonesia",
      titleLead: "Anda sudah tahu cara menjangkau trader.",
      titleRest: "Ubah kemampuan itu menjadi brand broker Anda sendiri.",
      text: "Baik melalui jaringan IB, akademi, komunitas, program affiliate, maupun trafik berbayar, Anda sudah memiliki aset yang berharga: akses ke trader. Gunakan kemampuan tersebut untuk membangun pengalaman trading dengan brand sendiri.",
      support: "Anda membawa audiens, jaringan, atau keahlian akuisisi. Quadcode menyediakan teknologi dan infrastrukturnya.",
      cta: "Jadwalkan demo",
      awardsLabel: "Penghargaan industri",
      awardsYear: "2025"
    },
    featured: { label: "Featured In", aria: "Quadcode disebutkan di media terkemuka" },
    steps: {
      eyebrow: "Dari akses ke trader menuju brand Anda sendiri",
      title: "Ubah kemampuan menjangkau trader menjadi bisnis milik Anda.",
      items: [
        ["Anda sudah memiliki akses ke trader", "Melalui jaringan IB, akademi, komunitas, program affiliate, atau trafik berbayar."],
        ["Saat ini Anda hanya memperoleh sebagian dari nilainya", "Pendapatan Anda mungkin berasal dari komisi, rebate, pelatihan, atau kemitraan dengan broker, sementara hubungan trading tetap berada di platform pihak lain."],
        ["Bangun brand broker Anda sendiri", "Ubah kemampuan distribusi Anda menjadi pengalaman trading dengan brand sendiri dan dapatkan kendali lebih besar atas bisnis Anda."]
      ],
      cta: "Lihat model untuk bisnis saya",
      refer: {
        title: "Untuk Anda yang sudah memiliki akses ke trader",
        items: [
          ["Introducing Broker (IB)", "broker"],
          ["Akademi trading", "education"],
          ["Komunitas trading", "person"],
          ["Affiliate", "team"],
          ["Tim akuisisi trader", "business"],
          ["Kreator konten finansial", "person"]
        ]
      }
    },
    solution: {
      eyebrow: "Tidak perlu membangun dari nol",
      title: "Anda menjangkau trader. Quadcode menyediakan infrastrukturnya.",
      text: "Fokus pada audiens, jaringan, brand, dan pertumbuhan. Kami menyediakan teknologi yang diperlukan untuk mempersiapkan bisnis brokerage Anda.",
      items: ["Platform trading dengan brand Anda", "CRM, onboarding, dan back office", "Integrasi pembayaran dan KYC", "Pelaporan dan pengelolaan affiliate, IB, serta partner"],
      ownershipTitle: "Apa yang berubah?",
      ownershipFrom: "Komisi, rebate, atau pendapatan dari pihak lain",
      ownershipTo: "Kendali lebih besar atas brand, hubungan dengan klien, dan model bisnis Anda"
    },
    ecosystem: {
      eyebrow: "Satu infrastruktur yang terhubung",
      title: "Semua yang dibutuhkan brand broker Anda, terhubung dalam satu ekosistem.",
      aria: "Komponen infrastruktur brokerage yang disediakan dan dikoordinasikan oleh Quadcode"
    },
    demo: {
      eyebrow: "Jadwalkan demo",
      title: "Lihat bagaimana brand broker Anda dapat dibangun.",
      text: "Ceritakan bagaimana Anda menjangkau trader: melalui jaringan IB, akademi, komunitas, program affiliate, atau trafik berbayar. Tim kami akan menunjukkan platform dan membahas model yang sesuai untuk bisnis Anda.",
      benefits: ["Rancangan awal model brokerage", "Rekomendasi konfigurasi teknologi", "Langkah berikutnya menuju peluncuran"]
    },
    form: {
      fields: {
        name: "Nama", namePh: "Nama lengkap",
        email: "Email kerja", emailPh: "nama@perusahaan.com",
        country: "Negara", phone: "WhatsApp",
        model: "Model bisnis saat ini", modelPh: "Pilih model",
        comment: "Komentar", commentPh: "Ceritakan bagaimana Anda mendatangkan trader dan bagaimana model bisnis Anda saat ini..."
      },
      models: ["Introducing Broker (IB)", "Akademi trading", "Komunitas trading", "Affiliate", "Tim akuisisi / performance marketing", "Kreator konten finansial", "Lainnya"],
      consent: "Saya setuju untuk dihubungi oleh Quadcode dan menerima",
      privacy: "Privacy Policy",
      submit: "Jadwalkan demo",
      sending: "Mengirim...",
      successTitle: "Permintaan demo telah diterima.",
      success: "Permintaan Anda telah kami terima. Tim kami akan menghubungi Anda untuk menjadwalkan demo.",
      error: "Permintaan belum dapat dikirim. Periksa data dan coba lagi."
    },
    faq: {
      eyebrow: "FAQ",
      title: "Pertanyaan dasar sebelum memulai.",
      items: [
        ["Apakah saya benar-benar menerima 100% revenue?", "Ya, tentu. Sebagai pemilik bisnis dan brand, Anda menerima 100% pendapatan dari trader Anda dan hanya membayar software Quadcode."],
        ["Apakah saya perlu membeli hal lain untuk memulai brokerage?", "Anda tidak perlu membeli apa pun lagi; Anda hanya perlu membuat website sendiri. Itu saja. Kami sepenuhnya menangani liquidity, feeds, KYC, back office, serta biaya SMS dan email. Jadi, tidak ada pembayaran tambahan untuk menjalankan bisnis Anda sendiri."],
        ["Saya tidak memiliki keahlian trading. Bisakah saya tetap membuka brokerage?", "Hal terpenting adalah menjadi pebisnis, bukan trader. Kami memberikan konsultasi dan dukungan ahli di setiap tahap operasional brokerage Anda. Fokuslah menjadi entrepreneur. Kami menangani sisanya."],
        ["Apakah saya harus menjalankan back office sendiri?", "Kami sepenuhnya menangani sisi operasional dan teknis brokerage. Anda tidak perlu memiliki back office sendiri."],
        ["Apakah saya perlu membangun tim dan infrastruktur?", "Anda hanya bertanggung jawab atas tiga aspek bisnis: menarik customer, memberikan customer support, dan tentu saja menghasilkan profit. Kami menangani seluruh aspek lainnya dari bisnis brokerage Anda. Anda tidak perlu merekrut staf tambahan."],
        ["Apakah saya memerlukan lisensi broker?", "Kami membantu Anda memenuhi seluruh regulatory requirements."]
      ]
    },
    footer: {
      line: "Audiens Anda. Brand broker Anda.",
      privacy: "Privacy Policy"
    }
  },
  en: {
    meta: {
      title: "Turn Your Access to Traders Into a Brokerage Brand | Quadcode",
      description: "Turn your audience, network or acquisition expertise into a trading experience under your own brand."
    },
    nav: { how: "How it works", solution: "Solution", faq: "FAQ", cta: "Book a demo" },
    hero: {
      eyebrow: "For teams that already reach traders: IBs, academies, communities, affiliates and acquisition teams in Indonesia",
      titleLead: "You already know how to reach traders.",
      titleRest: "Turn that capability into a brokerage brand of your own.",
      text: "Whether through an IB network, an academy, a community, affiliate activity or paid traffic, you already have a valuable asset: access to traders. Turn it into a trading experience under your own brand.",
      support: "You bring the audience, network or acquisition expertise. Quadcode provides the technology and infrastructure.",
      cta: "Book a demo",
      awardsLabel: "Industry recognition",
      awardsYear: "2025"
    },
    featured: { label: "Featured In", aria: "Quadcode featured in leading media outlets" },
    steps: {
      eyebrow: "From access to traders to your own brand",
      title: "Turn your ability to reach traders into a business of your own.",
      items: [
        ["You already have access to traders", "Through an IB network, an academy, a community, affiliate programs or paid traffic."],
        ["Today you capture only part of the value", "Your revenue may come from commissions, rebates, education or broker partnerships, while the trading relationship remains on someone else’s platform."],
        ["Build your own brokerage brand", "Turn your distribution capability into a branded trading experience and gain more control over the business."]
      ],
      cta: "See the model for my business",
      refer: {
        title: "For teams that already have access to traders",
        items: [
          ["Introducing Brokers", "broker"],
          ["Trading academies", "education"],
          ["Trading communities", "person"],
          ["Affiliates", "team"],
          ["Trader-acquisition teams", "business"],
          ["Financial content creators", "person"]
        ]
      }
    },
    solution: {
      eyebrow: "No need to build from scratch",
      title: "You reach the traders. Quadcode provides the infrastructure.",
      text: "Focus on your audience, network, brand and growth. We provide the technology required to prepare your brokerage business.",
      items: ["Branded trading platform", "CRM, onboarding and back office", "Payment and KYC integrations", "Reporting and affiliate, IB and partner management"],
      ownershipTitle: "What changes?",
      ownershipFrom: "Commissions, rebates or third-party monetization",
      ownershipTo: "More control over your brand, client relationship and business model"
    },
    ecosystem: {
      eyebrow: "One connected infrastructure",
      title: "Everything your brokerage brand needs, connected in one ecosystem.",
      aria: "Brokerage infrastructure components provided and coordinated by Quadcode"
    },
    demo: {
      eyebrow: "Book a Demo",
      title: "See how your brokerage brand could be built.",
      text: "Tell us how you reach traders: through an IB network, an academy, a community, affiliate activity or paid traffic. Our team will show you the platform and discuss which model may fit your business.",
      benefits: ["Preliminary brokerage model", "Recommended technology setup", "Next steps towards launch"]
    },
    form: {
      fields: {
        name: "Name", namePh: "Full name",
        email: "Work email", emailPh: "name@company.com",
        country: "Country", phone: "WhatsApp",
        model: "Current business model", modelPh: "Select a model",
        comment: "Comment", commentPh: "Tell us how you acquire traders and how your current business model works..."
      },
      models: ["Introducing Broker (IB)", "Trading academy", "Trading community", "Affiliate", "Trader-acquisition / performance-marketing team", "Financial content creator", "Other"],
      consent: "I agree to be contacted by Quadcode and accept the",
      privacy: "Privacy Policy",
      submit: "Book a demo",
      sending: "Sending...",
      successTitle: "Your demo request has been received.",
      success: "We have received your request. Our team will contact you to arrange the demo.",
      error: "We could not send the request. Check the details and try again."
    },
    faq: {
      eyebrow: "FAQ",
      title: "The basic questions before you start.",
      items: [
        ["Do I really get 100% of the revenue?", "Yes, of course. As both the business owner and brand owner, you receive 100% of the earnings from your traders and only pay us for our software."],
        ["Do I have to buy anything else to start my brokerage?", "You don’t need to purchase anything else; you only need to create your own website. That’s it. We take care of liquidity, feeds, KYC, the back office, and SMS and email costs entirely. So you won’t have any extra payments for operating your own business."],
        ["I don’t have trading expertise. Can I still open a brokerage?", "The most important thing is to be a businessperson, not a trader. We provide expert consultation and support at every stage of operating your brokerage business. Focus on being an entrepreneur. We take care of everything else."],
        ["Do I have to run the back office myself?", "We take care of the operational and technical side of the brokerage entirely. You don’t need to have your own back office."],
        ["Do I need to build a team and infrastructure?", "You are only responsible for three aspects of your business: attracting customers, offering customer support and, of course, generating profit. We take care of all other aspects of your brokerage business. You don’t need to hire additional staff."],
        ["Do I need a broker license?", "We help you with all regulatory requirements."]
      ]
    },
    footer: {
      line: "Your audience. Your brokerage brand.",
      privacy: "Privacy Policy"
    }
  }
};

const iconPaths = {
  arrow: ["M5 12h14", "M14 7l5 5-5 5"],
  check: ["M5 12l4 4L19 6"],
  lock: ["M6 10h12v11H6z", "M8 10V7a4 4 0 018 0v3"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  close: ["M6 6l12 12", "M18 6L6 18"]
};

function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name].map((path) => <path d={path} key={path} />)}</svg>;
}

function Brand({ inverse = false }) {
  return <img className="brand-logo" src={assetUrl(inverse ? "assets/qbs_logo_white.png" : "assets/qbs_logo.png")} alt="Quadcode Brokerage Solutions" />;
}

function getLocale() {
  const pathname = window.location.pathname.toLowerCase();
  const localPath = pathname.startsWith(appBase.toLowerCase()) ? pathname.slice(appBase.length) : pathname;
  return localPath.startsWith("/en") ? "en" : "id";
}

function track(event, properties = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...properties });
}

function App() {
  const [locale, setLocale] = useState(getLocale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const t = copy[locale];

  const scrollTo = (id, event = "navigation_click") => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
    track(event, { target: id, language: locale });
  };

  const changeLocale = (nextLocale) => {
    if (nextLocale === locale) return;
    window.history.pushState({}, "", `${appBase}/${nextLocale}/${window.location.search}${window.location.hash}`);
    setLocale(nextLocale);
    setMenuOpen(false);
    track("language_switch", { language: nextLocale });
  };

  useEffect(() => {
    if (window.location.pathname === "/" || window.location.pathname === appBase || window.location.pathname === `${appBase}/`) {
      window.history.replaceState({}, "", `${appBase}/id/${window.location.search}${window.location.hash}`);
    }
    const onPopState = () => setLocale(getLocale());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", t.meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", t.meta.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${appBase}/${locale}/`);
  }, [locale, t]);

  useEffect(() => {
    const onScroll = () => {
      const demo = document.getElementById("demo");
      const demoReached = demo ? demo.getBoundingClientRect().top < window.innerHeight : false;
      setShowMobileCta(window.scrollY > window.innerHeight * 0.75 && !demoReached);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useStageTracking(locale);

  return <>
    <Header t={t.nav} locale={locale} changeLocale={changeLocale} scrollTo={scrollTo} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <main>
      <Hero t={t.hero} scrollTo={scrollTo} />
      <FeaturedMarquee t={t.featured} />
      <Steps t={t.steps} scrollTo={scrollTo} />
      <Solution t={t.solution} scrollTo={scrollTo} />
      <EcosystemOrbit t={t.ecosystem} />
      <DemoSection t={t.demo} form={t.form} locale={locale} />
      <FAQ t={t.faq} locale={locale} />
    </main>
    <Footer t={t.footer} />
    <button className={`mobile-cta ${showMobileCta ? "is-visible" : ""}`} onClick={() => scrollTo("demo", "mobile_book_demo_cta")}>{t.hero.cta}<Icon name="arrow" /></button>
  </>;
}

function Header({ t, locale, changeLocale, scrollTo, menuOpen, setMenuOpen }) {
  return <header className="site-header">
    <button className="brand-button" onClick={() => scrollTo("top")} aria-label="Quadcode home"><Brand /></button>
    <nav className={menuOpen ? "is-open" : ""} aria-label="Main navigation">
      <button onClick={() => scrollTo("how")}>{t.how}</button>
      <button onClick={() => scrollTo("solution")}>{t.solution}</button>
      <button onClick={() => scrollTo("faq")}>{t.faq}</button>
    </nav>
    <div className="header-actions">
      <div className="language-switch" aria-label="Language selector">
        <button className={locale === "id" ? "active" : ""} onClick={() => changeLocale("id")}>ID</button><span>/</span><button className={locale === "en" ? "active" : ""} onClick={() => changeLocale("en")}>EN</button>
      </div>
      <button className="header-cta" onClick={() => scrollTo("demo", "header_book_demo_cta")}>{t.cta}<Icon name="arrow" /></button>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation"><Icon name={menuOpen ? "close" : "menu"} /></button>
    </div>
  </header>;
}

function Hero({ t, scrollTo }) {
  return <section className="hero" id="top" data-stage="hero">
    <div className="hero-copy">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1><span className="hero-title-lead">{t.titleLead}</span><span className="hero-title-rest">{t.titleRest}</span></h1>
      <p className="hero-text">{t.text}</p>
      <p className="hero-support">{t.support}</p>
      <div className="hero-action"><button className="button button-dark" onClick={() => scrollTo("demo", "hero_book_demo_cta")}>{t.cta}<Icon name="arrow" /></button></div>
    </div>
    <div className="hero-visual-column">
      <HeroVideo />
      <AwardsSlider t={t} />
    </div>
  </section>;
}

function HeroVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let retryTimer;
    const playVideo = ({ restart = false } = {}) => {
      if (document.hidden) return;
      window.clearTimeout(retryTimer);
      video.defaultMuted = true;
      video.muted = true;
      video.loop = true;
      if (restart || video.ended) video.currentTime = 0;
      video.play().catch(() => {
        retryTimer = window.setTimeout(() => playVideo(), 700);
      });
    };

    const handlePause = () => {
      if (!document.hidden) retryTimer = window.setTimeout(() => playVideo(), 120);
    };
    const handleEnded = () => playVideo({ restart: true });
    const handleVisibility = () => {
      if (!document.hidden) playVideo();
    };
    const handleRecovery = () => playVideo();

    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("canplay", handleRecovery);
    video.addEventListener("stalled", handleRecovery);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleRecovery);
    window.addEventListener("pageshow", handleRecovery);

    const watchdog = window.setInterval(() => {
      if (!document.hidden && (video.paused || video.ended)) playVideo({ restart: video.ended });
    }, 1500);

    playVideo();
    return () => {
      window.clearTimeout(retryTimer);
      window.clearInterval(watchdog);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("canplay", handleRecovery);
      video.removeEventListener("stalled", handleRecovery);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleRecovery);
      window.removeEventListener("pageshow", handleRecovery);
    };
  }, []);

  return <div className="hero-media" data-visual-slot="hero">
    <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
      <source src={assetUrl("assets/quadcode-building.mp4")} type="video/mp4" />
    </video>
  </div>;
}

function AwardsSlider({ t }) {
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const award = awards[active];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const interval = window.setInterval(() => setActive((index) => (index + 1) % awards.length), 4200);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return <section className="award-slider" role="region" aria-label={`${t.awardsLabel} ${t.awardsYear}`}>
    <div className="award-slide" aria-live="off" key={award.title}>
      <div className="award-image-wrap"><img src={award.image} alt="" width="100" height="150" /></div>
      <div className="award-copy"><span>{t.awardsLabel} · {t.awardsYear}</span><strong>{award.title}</strong></div>
    </div>
  </section>;
}

function FeaturedMarquee({ t }) {
  return <section className="featured-marquee" aria-label={t.aria} data-stage="featured_media">
    <div className="featured-label"><span>{t.label}</span></div>
    <div className="featured-window">
      <div className="featured-track">
        {[0, 1].map((setIndex) => <div className="featured-set" aria-hidden={setIndex === 1 ? "true" : undefined} key={setIndex}>{featuredLogos.map((logo) => <img src={logo.image} alt={setIndex === 0 ? logo.name : ""} key={`${setIndex}-${logo.name}`} loading="eager" />)}</div>)}
      </div>
    </div>
  </section>;
}

function SectionHeading({ eyebrow, title, text }) {
  return <div className="section-heading"><p className="eyebrow red">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-text">{text}</p>}</div>;
}

function Steps({ t, scrollTo }) {
  return <section className="steps section" id="how" data-stage="three_steps">
    <SectionHeading eyebrow={t.eyebrow} title={t.title} />
    <div className="steps-list">{t.items.map(([title, text], index) => <article key={title}>
      <span className={`step-marker ${index === 0 ? "step-marker--check" : "step-marker--brand"}`} aria-hidden="true">
        {index === 0 ? <Icon name="check" size={20} /> : <img src={assetUrl("assets/qc-logo-emblem.png")} alt="" />}
      </span>
      <div><h3>{title}</h3><p>{text}</p></div>
    </article>)}</div>
    <button className="text-cta" onClick={() => scrollTo("demo", "steps_book_demo_cta")}>{t.cta}<Icon name="arrow" /></button>
    <ReferralMarquee t={t.refer} />
  </section>;
}

function ReferralPillIcon({ name }) {
  return <img src={assetUrl(`assets/audience-icons/${name}.svg`)} alt="" aria-hidden="true" />;
}

function ReferralMarquee({ t }) {
  const marqueeRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let inView = false;
    const sync = () => setIsActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { rootMargin: "10% 0px", threshold: 0.12 });
    if (marqueeRef.current) observer.observe(marqueeRef.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <aside ref={marqueeRef} className={`referral-marquee ${isActive ? "is-active" : ""}`} data-stage="qualified_referrals" aria-labelledby="referral-marquee-title">
    <div className="referral-copy">
      <h3 id="referral-marquee-title">{t.title}</h3>
    </div>
    <div className="referral-window" aria-label={t.items.map(([label]) => label).join(", ")}>
      <div className="referral-row">
        {[0, 1].map((setIndex) => <div className="referral-set" aria-hidden={setIndex === 1 ? "true" : undefined} key={setIndex}>
          {t.items.map(([label, icon]) => <span className="referral-pill" key={`${setIndex}-${label}`}><span aria-hidden="true"><ReferralPillIcon name={icon} /></span>{label}</span>)}
        </div>)}
      </div>
    </div>
  </aside>;
}

function Solution({ t, scrollTo }) {
  return <section className="solution" id="solution" data-stage="solution">
    <div className="solution-inner">
      <div className="solution-copy"><SectionHeading eyebrow={t.eyebrow} title={t.title} text={t.text} /><ul>{t.items.map((item) => <li key={item}><Icon name="check" size={18} />{item}</li>)}</ul></div>
      <div className="ownership-box"><p>{t.ownershipTitle}</p><div><del>{t.ownershipFrom}</del><Icon name="arrow" size={24} /><strong>{t.ownershipTo}</strong></div><button className="button button-red" onClick={() => scrollTo("demo", "solution_book_demo_cta")}>{copy[getLocale()].nav.cta}<Icon name="arrow" /></button></div>
    </div>
  </section>;
}

function EcosystemOrbit({ t }) {
  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let inView = false;
    const sync = () => setIsActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { rootMargin: "12% 0px", threshold: 0.08 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <section ref={sectionRef} className={`ecosystem-orbit ${isActive ? "is-active" : ""}`} data-stage="operating_ecosystem" aria-labelledby="ecosystem-title">
    <div className="ecosystem-heading">
      <p className="eyebrow red">{t.eyebrow}</p>
      <h2 id="ecosystem-title">{t.title}</h2>
    </div>
    <div className="orbit-stage" role="img" aria-label={t.aria}>
      <span className="orbit-ring orbit-ring--outer" aria-hidden="true" />
      <span className="orbit-ring orbit-ring--inner" aria-hidden="true" />
      <span className="orbit-ring orbit-ring--core" aria-hidden="true" />
      <ul className="orbit-entities">
        {orbitEntities.map((entity) => {
          const isOuter = entity.ring === "outer";
          const style = {
            "--start": `${entity.start}deg`,
            "--radius": isOuter ? "41cqw" : "23.5cqw",
            "--duration": isOuter ? "96s" : "72s",
            "--entity-width": `${entity.width}cqw`
          };
          return <li className={`orbit-entity ${isOuter ? "" : "orbit-entity--reverse"}`} style={style} key={entity.name}>
            <img src={entity.image} alt={entity.name} loading="eager" />
          </li>;
        })}
      </ul>
      <div className="orbit-center" aria-hidden="true"><img className="orbit-center-emblem" src={assetUrl("assets/qc-logo-emblem.png")} alt="" /></div>
    </div>
  </section>;
}

function DemoSection({ t, form, locale }) {
  return <section className="demo" id="demo" data-stage="demo_form">
    <div className="demo-copy"><Brand inverse /><SectionHeading eyebrow={t.eyebrow} title={t.title} text={t.text} /><ul>{t.benefits.map((item) => <li key={item}><Icon name="check" size={18} />{item}</li>)}</ul></div>
    <LeadForm t={form} locale={locale} />
  </section>;
}

function LeadForm({ t, locale }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("ID");
  const phoneRef = useRef(null);
  const started = useRef(false);
  const formId = useMemo(() => `demo-${Math.random().toString(36).slice(2)}`, []);

  const applyDialCode = (nextCountry) => {
    const selected = countries.find((item) => item.code === nextCountry) || countries[0];
    if (!phoneRef.current) return;
    const current = phoneRef.current.value.trim();
    const stripped = countries.reduce((value, item) => value.replace(new RegExp(`^\\${item.dial}\\s*`), ""), current);
    phoneRef.current.value = `${selected.dial}${stripped ? ` ${stripped}` : " "}`;
  };

  useEffect(() => applyDialCode("ID"), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    setStatus("loading");
    setMessage("");
    track("demo_submit_attempt", { language: locale });

    const payload = {
      first_name: values.get("first_name"),
      email: values.get("email"),
      phone: values.get("phone"),
      phone_country: values.get("phone_country"),
      current_model: values.get("current_model"),
      launch_horizon: "To be discussed during demo",
      regulatory_status: "To be discussed during demo",
      comment: values.get("comment"),
      terms_agree: values.get("terms_agree") === "on",
      source_url: window.location.href,
      page_path: window.location.pathname,
      lang_by_browser: locale,
      roistat_id: readCookie("roistat_visit"),
      ...Object.fromEntries(utmFields.map((field) => [field, params.get(field) || ""]))
    };

    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || t.error);
      form.reset();
      setCountry("ID");
      requestAnimationFrame(() => applyDialCode("ID"));
      setStatus("success");
      setMessage(t.success);
      track("demo_submit_success", { language: locale, current_model: payload.current_model });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t.error);
      track("demo_submit_error", { language: locale });
    }
  };

  if (status === "success") return <div className="form-shell success-state"><span>✓</span><h3>{t.successTitle}</h3><p>{message}</p></div>;

  return <div className="form-shell"><form onSubmit={handleSubmit} onFocusCapture={() => { if (!started.current) { started.current = true; track("demo_form_start", { language: locale }); } }}>
    <div className="form-grid"><Field label={t.fields.name} id={`${formId}-name`} required><input id={`${formId}-name`} name="first_name" autoComplete="name" placeholder={t.fields.namePh} required /></Field><Field label={t.fields.email} id={`${formId}-email`} required><input id={`${formId}-email`} name="email" type="email" autoComplete="email" placeholder={t.fields.emailPh} required /></Field></div>
    <div className="phone-grid"><Field label={t.fields.country} id={`${formId}-country`}><select id={`${formId}-country`} name="phone_country" value={country} onChange={(event) => { setCountry(event.target.value); applyDialCode(event.target.value); }}>{countries.map((item) => <option value={item.code} key={item.code}>{item.code} {item.dial}</option>)}</select></Field><Field label={t.fields.phone} id={`${formId}-phone`} required><input ref={phoneRef} id={`${formId}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" required onFocus={() => track("whatsapp_field_focus", { language: locale })} /></Field></div>
    <SelectField label={t.fields.model} id={`${formId}-model`} name="current_model" placeholder={t.fields.modelPh} options={t.models} required />
    <Field label={t.fields.comment} id={`${formId}-comment`}><textarea id={`${formId}-comment`} name="comment" placeholder={t.fields.commentPh} /></Field>
    <label className="consent"><input type="checkbox" name="terms_agree" required /><span>{t.consent} <a href={privacyUrl} target="_blank" rel="noreferrer">{t.privacy}</a>.</span></label>
    <button className="button button-red form-submit" type="submit" disabled={status === "loading"}>{status === "loading" ? t.sending : t.submit}<Icon name="arrow" /></button>
    {message && <div className={`form-message ${status}`} role="status">{message}</div>}
  </form></div>;
}

function Field({ label, id, required, children }) {
  return <div className="field"><label htmlFor={id}>{label}{required && <span> *</span>}</label>{children}</div>;
}

function SelectField({ label, id, name, placeholder, options, required = false }) {
  return <Field label={label} id={id} required={required}><select id={id} name={name} defaultValue="" required={required}><option value="" disabled>{placeholder}</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></Field>;
}

function FAQ({ t, locale }) {
  return <section className="faq section" id="faq" data-stage="faq"><SectionHeading eyebrow={t.eyebrow} title={t.title} /><div className="faq-list">{t.items.map(([question, answer]) => <details key={`${locale}-${question}`} onToggle={(event) => event.currentTarget.open && track("faq_open", { question, language: locale })}><summary><strong>{question}</strong><i /></summary><p>{answer}</p></details>)}</div></section>;
}

function Footer({ t }) {
  return <footer><div><Brand inverse /><strong>{t.line}</strong><a href={privacyUrl} target="_blank" rel="noreferrer">{t.privacy}<Icon name="arrow" size={16} /></a></div><span>© {new Date().getFullYear()} Quadcode Brokerage Solutions</span></footer>;
}

function readCookie(name) {
  return document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.split("=").slice(1).join("=") || "";
}

function useStageTracking(locale) {
  useEffect(() => {
    const seen = new Set();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const stage = entry.target.dataset.stage;
      if (entry.isIntersecting && stage && !seen.has(stage)) {
        seen.add(stage);
        track("narrative_stage_view", { stage, language: locale });
      }
    }), { threshold: 0.3 });
    document.querySelectorAll("[data-stage]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [locale]);
}

const appRoot = window.__quadcodeLandingRoot || createRoot(document.getElementById("root"));
window.__quadcodeLandingRoot = appRoot;
appRoot.render(<App />);
