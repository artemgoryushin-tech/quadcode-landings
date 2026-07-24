---
name: Quadcode Indonesia — Direct Conversion
description: A concise bilingual landing page that turns an existing audience into one clear next action: book a brokerage demo.
---

# Design System: Quadcode Indonesia — Direct Conversion

## Overview

**Creative North Star: “One idea, one path, one action.”**

The page is deliberately editorial and direct. It uses the official Quadcode identity, large plain-language typography, generous white space, and a single conversion action. The design does not invent product screens or diagrams. The hero uses approved Quadcode brand footage as its primary visual.

## Colors

- Quadcode red: `#e62b3d`
- Deep red: `#c8172a`
- Black: `#111216`
- White: `#ffffff`
- Warm neutral: `#f4f3f0`
- Body text: `#5f6269`
- Rules: `#d8d7d3`

Red is used for primary actions and the demo-conversion surface. Black is used for the economics explanation and form. White owns the reading experience.

The supplied blurred finance-symbol image is reserved for the hero. It runs full-width behind the opening proposition as a quiet environmental texture, while the infrastructure section returns to a solid warm-neutral surface. The supplied black texture unifies every major dark surface: the award carousel, Featured In strip, hero-video fallback, compact ownership box, form shell, and footer. It remains subtle enough to preserve hierarchy and reading contrast.

## Typography

Use only the approved Proxima Nova files. Display copy uses weight `900`, line-height `0.90–0.94`, and tracking no tighter than `-0.04em`. The opening phrase of the hero title uses a permanent red, line-cloned background with white text; the rest of the title remains black. Body copy uses regular or semibold weight at `1.5–1.65` line-height. Uppercase labels are limited to short orientation text.

## Layout

- Maximum content width: `1280px`.
- Desktop gutters: `32px` minimum.
- Mobile gutters: `16px`.
- Hero: direct copy and CTA beside approved Quadcode brand footage.
- Body: a simple linear sequence — 1/2/3 explanation, infrastructure, demo form, FAQ.
- Mobile: every split collapses into a single reading column.

## Components

### Official logo

Use only `qbs_logo.png` on light backgrounds and `qbs_logo_white.png` on dark or red backgrounds. Never recreate, abbreviate, animate, recolor, or replace the mark.

### Primary action

Square-cornered, minimum `48px` high, bold label and right arrow. The label is always “Book a demo” or its Bahasa Indonesia equivalent.

### Hero video

A silent, continuously looping `16:10` crop of the supplied Quadcode building footage. The video fills the visual area without controls. On a visible page it automatically recovers from an unexpected pause, restarts after completion, and resumes when the visitor returns to the tab. Browsers may suspend media while a tab is hidden, but the static fallback must not remain after the page becomes visible. It contains no overlay copy, improvised branding, or decorative framing.

### Award carousel

One compact dark carousel sits directly below the hero visual slot. It displays one supplied award trophy at a time with its approved title and the year `2025`. The transparent trophy artwork sits directly on the dark surface without an individual card or background. Slides rotate automatically with a restrained opacity transition; there are no arrows, pagination, or counters. The block and artwork dimensions remain fixed between slides, and reduced-motion users receive a static slide.

### Featured In marquee

A single black media strip follows the hero. The red `Featured In` label stays fixed while the five supplied white media logos move as one continuous track. The repeated track is hidden from assistive technology and motion is disabled for reduced-motion users.

### Three-step list

One vertical ruled list with semantic markers instead of sequence numbers. The first row uses a white check inside a red circle to show the audience asset already exists. The second and third rows use the supplied official Quadcode emblem to mark the stages enabled by Quadcode. Each row contains one short heading and one concise explanation.

The bottom of this section contains the Ambassador Program-inspired `Who this solution is for` module. A concise single-line heading introduces one slowly moving horizontal row of six categories: affiliates, introducing brokers, trading academies, trading communities, performance-marketing teams, and financial content creators. Every category uses only the five original line-icon assets extracted from the supplied Ambassador Program reference; no new icon artwork is introduced, and the person icon is reused where needed. There is only a tight `6px` gap between pills. A hidden duplicate track enables the seamless `54s` loop; motion pauses offscreen, when the document is hidden, on hover, and for reduced-motion users.

### Economics explanation

A single black surface showing the movement from referral commission to more control over brand, client journey, and commercial model. The surface stays concise and contains no small-print qualifier.

### Operating ecosystem orbit

A compact, light-background orbital scene follows the infrastructure section. Eleven supplied product-module labels move slowly around the supplied official Quadcode emblem on two concentric paths. The emblem sits directly inside the core ring without a card, wordmark, or shadow. The outer path completes a rotation in `96s`; the inner path counter-rotates in `72s`. Labels remain upright, animation pauses offscreen or when the document is hidden, and reduced-motion users receive the complete static composition. The entire section is intentionally secondary to the proposition and conversion form.

### Demo form

Dark field surfaces with visible labels, native validation, red focus state, `+62` default WhatsApp country code, current business model, and one full-width submit action. On mobile, fields become one column except country and WhatsApp.

### FAQ

Six native disclosure rows using the user-approved English commercial answers and equivalent Bahasa Indonesia copy. No decorative cards and no repeated CTA inside the accordion.

## Do’s and Don’ts

### Do

- Keep the entire proposition understandable in under 30 seconds.
- Repeat one action consistently: book a demo.
- Keep required consent and privacy information in the form and footer, but do not add small-print marketing qualifiers to the hero or solution sections.
- Use only approved visuals supplied by Quadcode in the hero.
- Use only the supplied award and media-logo files in the trust modules.
- Use only the supplied product-module label images in the operating ecosystem orbit.
- Keep the supplied finance-symbol hero background subtle enough that all opening copy maintains reading contrast.

### Don’t

- Do not add product-feature sections, long lifecycle diagrams, event footage, awards, or statistics without a new brief.
- Do not invent visuals, dashboards, icons, or logo variants.
- Do not promise a guaranteed revenue amount, guaranteed results, or a licensing shortcut. The approved FAQ may describe the supplied `100% of earnings` commercial model, but it must not be reframed as guaranteed profitability.
- Do not rebuild the page as an icon-card grid.
