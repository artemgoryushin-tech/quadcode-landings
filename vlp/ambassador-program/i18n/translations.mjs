import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ru from "./strings.ru.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(readFileSync(path.join(__dirname, `${name}.json`), "utf8"));

/** @type {Record<string, [string, string][]>} */
export const replacements = {
  ru,
  pt: load("pt"),
  es: load("es"),
  th: load("th"),
  ko: load("ko"),
  vi: load("vi"),
};
