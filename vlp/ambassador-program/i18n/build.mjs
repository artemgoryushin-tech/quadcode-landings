import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { replacements } from "./translations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const programRoot = path.join(__dirname, "..");
const srcPath = path.join(programRoot, "index.html");

const LANG_ORDER = ["en", "ru", "pt", "es", "th", "ko", "vi"];
const LANG_LABEL = { en: "Eng", ru: "Rus", pt: "Por", es: "Spa", th: "Tha", ko: "Kor", vi: "Vie" };

function buildSwitcher(locale, depth) {
  const link = (code) => {
    if (code === "en") return depth === 0 ? "./" : "../";
    return (depth === 0 ? "./" : "../") + `${code}/`;
  };
  const links = LANG_ORDER.map((code) => {
    const cls = code === locale ? "active " : " ";
    return `<a href="${link(code)}" class="${cls}svelte-bvm2rm">${LANG_LABEL[code]}</a>`;
  }).join("\n                        ");
  return `<div class="lp-qc-lang" data-lp-locale="${locale}">
                <div class="lang svelte-bvm2rm lang_animation">
                  <div class="lang__container svelte-bvm2rm">
                    <div
                      class="lang__btn svelte-bvm2rm"
                      role="button"
                      tabindex="0"
                      aria-expanded="false"
                      aria-haspopup="listbox"
                      aria-label="Language"
                    >
                      <div class="lang__text svelte-bvm2rm">${LANG_LABEL[locale]}</div>
                      <div class="lang__icon svelte-bvm2rm">
                        <div class="lang__arrow lang__arrow-down svelte-bvm2rm"></div>
                        <div class="lang__arrow lang__arrow-up svelte-bvm2rm"></div>
                      </div>
                    </div>
                    <div class="lang__list svelte-bvm2rm" role="listbox" aria-label="Languages">
                      <div class="lang__inner svelte-bvm2rm">
                        ${links}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- end lp-qc-lang -->`;
}

function replaceSwitcher(html, locale, depth) {
  return html.replace(/<div class="lp-qc-lang"[\s\S]*?<!-- end lp-qc-lang -->/, buildSwitcher(locale, depth));
}

function fixAssetPaths(html, depth) {
  if (depth === 0) return html;
  return html
    .replaceAll('src="./assets/', 'src="../assets/')
    .replaceAll('href="./assets/', 'href="../assets/')
    .replaceAll('src="assets/', 'src="../assets/');
}

function patchHeadUrls(html, locale) {
  const root = "https://quadcode.com/vlp/ambassador-program/";
  const canonical = locale === "en" ? root : `${root}${locale}/`;

  html = html.replace(/<base href="[^"]*">/, `<base href="${canonical}">`);
  html = html.replace(/<html lang="en">/, `<html lang="${locale}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonical}" />`);
  return html;
}

function applyReplacements(html, locale) {
  const pairs = replacements[locale];
  if (!pairs) return html;
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
  let out = html;
  for (const [from, to] of sorted) {
    out = out.split(from).join(to);
  }
  return out;
}

const src = fs.readFileSync(srcPath, "utf8");
const SWITCHER_RE = /<div class="lp-qc-lang"[\s\S]*?<!-- end lp-qc-lang -->/;

if (!SWITCHER_RE.test(src)) {
  console.error("index.html: missing lp-qc-lang block");
  process.exit(1);
}

for (const locale of Object.keys(replacements)) {
  const depth = 1;
  let html = src;
  html = replaceSwitcher(html, locale, depth);
  html = fixAssetPaths(html, depth);
  html = patchHeadUrls(html, locale);
  html = applyReplacements(html, locale);
  const dir = path.join(programRoot, locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  console.log("wrote", locale + "/index.html");
}

console.log("done");
