import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const basePath = import.meta.env.BASE_URL || "/";

function assetPath(path) {
  return `${basePath}${path.replace(/^\/+/, "")}`;
}

const videos = [
  {
    title: "Affiliate World floor",
    copy: "Find us inside the Bangkok event flow and plan the conversation before the rush.",
    src: assetPath("media/floor-view.mp4"),
    poster: assetPath("posters/floor-view.jpg")
  },
  {
    title: "Booth conversations",
    copy: "Talk through launch, acquisition and brokerage operations with the Quadcode team.",
    src: assetPath("media/booth-talk.mp4"),
    poster: assetPath("posters/booth-talk.jpg")
  },
  {
    title: "Live product talks",
    copy: "Bring your traffic questions, broker roadmap and market priorities to the booth.",
    src: assetPath("media/live-product-talk.mp4"),
    poster: assetPath("posters/booth.jpg")
  }
];

const faqItems = [
  [
    "Do I really get 100% of the revenue?",
    "Yes. As both business owner and brand owner, you receive 100% of the earnings from your traders and only pay us for our software."
  ],
  [
    "I don't have trading expertise. Can I still open a broker?",
    "The most important thing is to be a business owner, not a trader. We provide expert consultation and support at every stage of operating your own brokerage business. Focus on being an entrepreneur; we take care of everything else."
  ],
  [
    "Do I need to build a team and infrastructure?",
    "You are responsible for three aspects of your business: attracting customers, offering customer support and generating profit. We take care of the other aspects of your brokerage business, so you don't need to hire additional staff."
  ],
  [
    "Do I have to run the back office myself?",
    "We take care of the operational and technical side of the brokerage entirely. You don't need to have your own back office."
  ]
];

const prizeCards = [
  {
    title: "AirPods",
    label: "Audio prize",
    src: assetPath("assets/prize-airpods.png"),
    className: "airpods"
  },
  {
    title: "iPhone",
    label: "Headline prize",
    src: assetPath("assets/prize-iphone.png"),
    className: "iphone"
  },
  {
    title: "Apple Watch",
    label: "Wearable prize",
    src: assetPath("assets/prize-watch.png"),
    className: "watch"
  }
];

const meetingSlots = [
  "Dec 9, morning",
  "Dec 9, afternoon",
  "Dec 10, morning",
  "Dec 10, afternoon",
  "Flexible"
];
const phoneCountries = [
  { code: "US", label: "US", dial: "+1" },
  { code: "GB", label: "UK", dial: "+44" },
  { code: "AE", label: "UAE", dial: "+971" },
  { code: "CY", label: "CY", dial: "+357" },
  { code: "TH", label: "TH", dial: "+66" },
  { code: "IN", label: "IN", dial: "+91" },
  { code: "BR", label: "BR", dial: "+55" },
  { code: "DE", label: "DE", dial: "+49" },
  { code: "FR", label: "FR", dial: "+33" },
  { code: "ES", label: "ES", dial: "+34" },
  { code: "IT", label: "IT", dial: "+39" },
  { code: "PT", label: "PT", dial: "+351" },
  { code: "ZA", label: "ZA", dial: "+27" },
  { code: "AU", label: "AU", dial: "+61" }
];
const privacyUrl = "https://quadcode.com/privacy-policy";
const giveawayTermsUrl = "#giveaway-terms";

function readCookie(name) {
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

function readFormValue(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTrackingPayload() {
  const params = new URLSearchParams(window.location.search);
  const payload = {};

  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const value = params.get(key);

    if (value) {
      payload[key] = value;
    }
  }

  const roistatId = readCookie("roistat_visit");

  if (roistatId) {
    payload.roistat_id = roistatId;
  }

  payload.lang_by_browser = localStorage.getItem("form__lang") || navigator.language?.split("-")[0] || "en";
  return payload;
}

function App() {
  useRevealOnScroll();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <MediaBand />
        <MainStageSection />
        <FAQSection />
        <GiveawaySection />
        <TermsSection />
        <RequestSection />
      </main>
      <Footer />
      <MobileStickyCta />
    </>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Quadcode Brokerage Solutions home">
        <img src={assetPath("assets/qbs_logo.png")} alt="Quadcode Brokerage Solutions" />
      </a>
      <nav aria-label="Main navigation">
        <a href="#why-meet">Why meet</a>
        <a href="#giveaway">Giveaway</a>
        <a href="#request">Request meeting</a>
      </nav>
      <a className="header-cta" href="#request">Book a meeting</a>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="hero"
      style={{ "--hero-background": `url("${assetPath("assets/dollar-percentage-bg.png")}")` }}
    >
      <div className="hero-copy reveal">
        <div className="event-lockup" aria-label="Affiliate World Asia 2026">
          <img
            className="event-lockup-mark"
            src={assetPath("assets/affiliate-world-logo-white.svg")}
            alt=""
            aria-hidden="true"
          />
          <span>
            Affiliate World Asia
            <img
              className="event-lockup-title"
              src={assetPath("assets/affiliate-world-bangkok-title.svg")}
              alt="Bangkok"
            />
          </span>
        </div>
        <h1>
          <span>Level up from</span> <span>affiliate to</span> <span>broker owner.</span>
        </h1>
        <p className="hero-lead">
          Stop sending traffic to someone else&apos;s brand. Build your own brokerage business with a white-label stack
          made for affiliates who already know how to generate demand.
        </p>
        <div className="affiliate-thesis" aria-label="Affiliate business upgrade points">
          <span>Own the brand</span>
          <span>Own the funnel</span>
          <span>Own the client relationship</span>
        </div>
        <p className="audience-line">For media buyers, affiliate teams and performance marketers ready to own the brand.</p>
        <div className="hero-actions">
          <a className="button primary" href="#request">Request a meeting</a>
          <a className="button secondary" href="#why-meet">Meet us at Booth A96</a>
        </div>
        <div className="hero-info-cards">
          <div className="speaker-card" aria-label="Main stage speaker time">
            <span>Main stage speaker</span>
            <strong>2:55 PM · Day 1</strong>
          </div>
          <div className="booth-card" aria-label="Quadcode booth number">
            <span>Meet us at</span>
            <strong>Booth A96</strong>
            <small>White-label brokerage tech, CRM, payments and operations in one launch stack.</small>
          </div>
        </div>
      </div>

      <div className="hero-media reveal" aria-label="Quadcode expo booth video">
        <img className="hero-poster" src={assetPath("posters/floor-view.jpg")} alt="" aria-hidden="true" />
        <video
          src={assetPath("media/hero-expo.mp4")}
          poster={assetPath("posters/floor-view.jpg")}
          muted
          playsInline
          loop
          preload="metadata"
          onMouseEnter={(event) => event.currentTarget.play().catch(() => {})}
          onMouseLeave={(event) => {
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
          }}
        />
        <div className="event-card">
          <span>Bangkok, Thailand</span>
          <strong>9-10 December 2026</strong>
          <span>Affiliate World Asia</span>
          <span className="booth-label">Meet us at</span>
          <strong className="booth-number">Booth A96</strong>
        </div>
      </div>
    </section>
  );
}

function MediaBand() {
  return (
    <section id="why-meet" className="media-band">
      <div className="section-heading reveal">
        <h2>Step into the conversation before the expo floor gets loud.</h2>
        <p>
          The booth meeting is for affiliate teams who want a practical conversation about brokerage launch, traffic
          quality and operating at scale.
        </p>
      </div>
      <div className="video-grid">
        {videos.map((video, index) => (
          <article className="video-tile reveal" key={video.title}>
            <div className="video-frame">
              <span className="tile-number">{index + 1}</span>
              <video
                src={video.src}
                poster={video.poster}
                muted
                playsInline
                loop
                preload="metadata"
                onMouseEnter={(event) => event.currentTarget.play().catch(() => {})}
                onMouseLeave={(event) => {
                  event.currentTarget.pause();
                  event.currentTarget.currentTime = 0;
                }}
              />
              <span className="play-dot" aria-hidden="true" />
            </div>
            <h3>{video.title}</h3>
            <p>{video.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MainStageSection() {
  return (
    <section className="stage-section">
      <div className="stage-copy reveal">
        <span>Main Stage · Day 1 · 2:55 PM</span>
        <h2>Hear how affiliates become broker owners.</h2>
        <p>
          Join our Main Stage talk, then come to Booth A96 with the questions that matter for your traffic model,
          launch plan and next step as a brand owner.
        </p>
      </div>
      <a className="button primary stage-cta reveal" href="#request">Book a meeting after the talk</a>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="faq-section">
      <div className="faq-copy reveal">
        <h2>Bring your questions. We will answer them at the booth.</h2>
        <p>
          The meeting is for affiliates who already know how to generate demand and want to understand what changes
          when they run traffic to their own white-label brokerage.
        </p>
      </div>
      <div className="faq-list reveal">
        {faqItems.map(([question, answer], index) => (
          <details className="faq-item" key={question} open={index === 0}>
            <summary>
              <span>{question}</span>
              <span className="faq-toggle" aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function GiveawaySection() {
  return (
    <section id="giveaway" className="giveaway-section">
      <div className="giveaway-visual reveal" aria-label="Giveaway prizes">
        <div className="prize-cards">
          {prizeCards.map((prize) => (
            <article className={`prize-card ${prize.className}`} key={prize.title}>
              <div className="prize-image">
                <img src={prize.src} alt={prize.title} loading="lazy" />
              </div>
              <div className="prize-meta">
                <span>{prize.label}</span>
                <strong>{prize.title}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="giveaway-copy reveal">
        <h2>A <span>bonus</span> for booth visitors.</h2>
        <p>
          The business conversation comes first. Submit the form, meet us at Booth A96, and join the prize draw for
          iPhone, AirPods and Apple Watch prizes.
        </p>
        <p className="terms-line">Final prize models, eligibility and timing follow giveaway terms.</p>
      </div>
    </section>
  );
}

function TermsSection() {
  return (
    <section id="giveaway-terms" className="legal-section terms-section">
      <h2>Giveaway terms</h2>
      <p>
        The prize draw is intended for eligible Affiliate World Asia 2026 visitors who submit a meeting request and
        check in with the Quadcode team at the booth. One entry per person. Final prize list, draw timing, eligibility,
        local restrictions and substitution rules may be confirmed or updated before the event. The giveaway is not
        affiliated with or endorsed by prize manufacturers.
      </p>
    </section>
  );
}

function RequestSection() {
  return (
    <section id="request" className="request-section">
      <div className="request-copy reveal">
        <img src={assetPath("assets/qbs_logo_white.png")} alt="Quadcode Brokerage Solutions" />
        <h2>Request a meeting at Affiliate World Asia.</h2>
        <p>
          Share your details and preferred time. Our team will review the request and confirm the slot manually before
          Affiliate World Asia.
        </p>
        <p className="request-trust">Meeting slots are confirmed manually by the Quadcode team before the event.</p>
      </div>
      <LeadForm />
    </section>
  );
}

function LeadForm() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("US");
  const phoneInputRef = useRef(null);
  const generatedId = useMemo(() => Math.random().toString(36).slice(2), []);
  const selectedCountry = phoneCountries.find((item) => item.code === country) ?? phoneCountries[0];

  function applyDialCode(nextCountryCode) {
    const nextCountry = phoneCountries.find((item) => item.code === nextCountryCode) ?? phoneCountries[0];
    const input = phoneInputRef.current;

    if (!input) {
      return;
    }

    const current = input.value.trim();
    const stripped = phoneCountries.reduce((value, item) => {
      const pattern = new RegExp(`^${escapeRegExp(item.dial)}\\s*`);
      return value.replace(pattern, "");
    }, current);

    input.value = `${nextCountry.dial}${stripped ? ` ${stripped}` : " "}`;
  }

  useEffect(() => {
    let isMounted = true;

    fetch("/api/geo", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        if (isMounted && typeof result.country === "string") {
          const supportedCountry = phoneCountries.some((item) => item.code === result.country) ? result.country : "US";
          setCountry(supportedCountry);
          window.requestAnimationFrame(() => applyDialCode(supportedCountry));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const trackingPayload = getTrackingPayload();
    const phoneValue = readFormValue(formData, "phone");
    const submittedCountry =
      phoneCountries.find((item) => item.code === readFormValue(formData, "phone_country")) ?? selectedCountry;
    const phone = phoneValue.startsWith("+") ? phoneValue : `${submittedCountry.dial} ${phoneValue}`;
    const payload = {
      first_name: readFormValue(formData, "first_name"),
      email: readFormValue(formData, "email"),
      phone,
      phone_country: readFormValue(formData, "phone_country"),
      tg: readFormValue(formData, "tg"),
      preferred_slot: readFormValue(formData, "preferred_slot"),
      comment: readFormValue(formData, "comment"),
      terms_agree: formData.get("terms_agree") === "on",
      page_path: window.location.pathname,
      source_url: window.location.href,
      ...trackingPayload
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message ?? "We could not send the request.");
      }

      window.dataLayer?.push({
        event: "lead_submit",
        form_id: "quadcode_aw_asia_2026_meeting_request",
        utm_source: trackingPayload.utm_source,
        utm_campaign: trackingPayload.utm_campaign
      });

      form.reset();
      setStatus("success");
      setMessage("Thank you. Your request has been sent, and we will contact you shortly.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not send the request.");
    }
  }

  return (
    <form className="lead-form reveal" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Field label="Name" htmlFor={`${generatedId}-name`} required>
          <input id={`${generatedId}-name`} name="first_name" autoComplete="name" required placeholder="Your name" />
        </Field>
        <Field label="Work email" htmlFor={`${generatedId}-email`} required>
          <input
            id={`${generatedId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
          />
        </Field>
      </div>

      <div className="phone-row">
        <Field label="Country" htmlFor={`${generatedId}-country`}>
          <select
            id={`${generatedId}-country`}
            name="phone_country"
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              applyDialCode(event.target.value);
            }}
          >
            {phoneCountries.map((item) => (
              <option value={item.code} key={item.code}>{item.label} {item.dial}</option>
            ))}
          </select>
        </Field>
        <Field label="Phone" htmlFor={`${generatedId}-phone`} required>
          <input
            ref={phoneInputRef}
            id={`${generatedId}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder={`${selectedCountry.dial} 555 000 0000`}
            onFocus={() => {
              if (!phoneInputRef.current.value.trim()) {
                applyDialCode(country);
              }
            }}
          />
        </Field>
      </div>

      <div className="form-grid">
        <Field label="Telegram" htmlFor={`${generatedId}-telegram`}>
          <input id={`${generatedId}-telegram`} name="tg" placeholder="@username" />
        </Field>
        <Field label="Preferred day/time" htmlFor={`${generatedId}-slot`}>
          <select id={`${generatedId}-slot`} name="preferred_slot" defaultValue="">
            <option value="" disabled>Choose a preferred slot</option>
            {meetingSlots.map((slot) => (
              <option value={slot} key={slot}>{slot}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes" htmlFor={`${generatedId}-notes`}>
        <textarea
          id={`${generatedId}-notes`}
          name="comment"
          placeholder="Traffic sources, GEOs, current broker setup, topics you want to discuss..."
        />
      </Field>

      <label className="consent">
        <input name="terms_agree" type="checkbox" required />
        <span>
          I agree to be contacted about a meeting with Quadcode Brokerage Solutions and accept the{" "}
          <a href={privacyUrl} target="_blank" rel="noreferrer">Privacy Policy</a> and{" "}
          <a href={giveawayTermsUrl}>Giveaway Terms</a>.
        </span>
      </label>

      <button className="button form-submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send meeting request"}
      </button>

      {message ? (
        <div className={`form-message ${status}`} role="status" aria-live="polite">
          {message}
        </div>
      ) : null}
    </form>
  );
}

function Field({ label, htmlFor, required, children }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? <span> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function Footer() {
  return (
    <footer>
      <span>Quadcode Brokerage Solutions</span>
      <div>
        <a href={privacyUrl} target="_blank" rel="noreferrer">Privacy Policy</a>
        <a href={giveawayTermsUrl}>Giveaway Terms</a>
      </div>
    </footer>
  );
}

function MobileStickyCta() {
  return (
    <a className="mobile-sticky-cta" href="#request">
      Book a meeting at Booth A96
    </a>
  );
}

function useRevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

const rootElement = document.getElementById("root");
const root = window.__quadcodeLandingRoot ?? createRoot(rootElement);
window.__quadcodeLandingRoot = root;
root.render(<App />);
