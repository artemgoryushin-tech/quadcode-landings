import { isSupportedCountry } from "libphonenumber-js/min";

function normalizeCountry(value) {
  const country = value?.trim().toUpperCase();
  return country && isSupportedCountry(country) ? country : "";
}

function countryFromAcceptLanguage(value) {
  if (!value) {
    return "";
  }

  const languages = value.split(",").map((item) => item.trim().split(";")[0]);

  for (const language of languages) {
    const country = normalizeCountry(language.split("-")[1]);

    if (country) {
      return country;
    }
  }

  return "";
}

export default function handler(request, response) {
  const headers = request.headers;
  const country =
    normalizeCountry(headers["x-vercel-ip-country"]) ||
    normalizeCountry(headers["cf-ipcountry"]) ||
    normalizeCountry(headers["cloudfront-viewer-country"]) ||
    normalizeCountry(headers["fastly-client-country"]) ||
    normalizeCountry(headers["fly-client-ip-country"]) ||
    normalizeCountry(headers["x-nf-country"]) ||
    normalizeCountry(headers["x-real-ip-country"]) ||
    normalizeCountry(headers["x-forwarded-country"]) ||
    normalizeCountry(headers["geoip-country-code"]) ||
    normalizeCountry(headers["x-country-code"]) ||
    countryFromAcceptLanguage(headers["accept-language"]) ||
    "US";

  response.status(200).json({ country });
}
