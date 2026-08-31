(() => {
  "use strict";

  const countryData = [
    ["AF", "Afghanistan", "+93"],
    ["AL", "Albania", "+355"],
    ["DZ", "Algeria", "+213"],
    ["AS", "American Samoa", "+1"],
    ["AD", "Andorra", "+376"],
    ["AO", "Angola", "+244"],
    ["AI", "Anguilla", "+1"],
    ["AG", "Antigua & Barbuda", "+1"],
    ["AR", "Argentina", "+54"],
    ["AM", "Armenia", "+374"],
    ["AW", "Aruba", "+297"],
    ["AU", "Australia", "+61"],
    ["AT", "Austria", "+43"],
    ["AZ", "Azerbaijan", "+994"],
    ["BS", "Bahamas", "+1"],
    ["BH", "Bahrain", "+973"],
    ["BD", "Bangladesh", "+880"],
    ["BB", "Barbados", "+1"],
    ["BY", "Belarus", "+375"],
    ["BE", "Belgium", "+32"],
    ["BZ", "Belize", "+501"],
    ["BJ", "Benin", "+229"],
    ["BM", "Bermuda", "+1"],
    ["BT", "Bhutan", "+975"],
    ["BO", "Bolivia", "+591"],
    ["BA", "Bosnia & Herzegovina", "+387"],
    ["BW", "Botswana", "+267"],
    ["BR", "Brazil", "+55"],
    ["IO", "British Indian Ocean Territory", "+246"],
    ["VG", "British Virgin Islands", "+1"],
    ["BN", "Brunei", "+673"],
    ["BG", "Bulgaria", "+359"],
    ["BF", "Burkina Faso", "+226"],
    ["BI", "Burundi", "+257"],
    ["KH", "Cambodia", "+855"],
    ["CM", "Cameroon", "+237"],
    ["CA", "Canada", "+1"],
    ["CV", "Cape Verde", "+238"],
    ["BQ", "Caribbean Netherlands", "+599"],
    ["KY", "Cayman Islands", "+1"],
    ["CF", "Central African Republic", "+236"],
    ["TD", "Chad", "+235"],
    ["CL", "Chile", "+56"],
    ["CN", "China", "+86"],
    ["CX", "Christmas Island", "+61"],
    ["CC", "Cocos Islands", "+61"],
    ["CO", "Colombia", "+57"],
    ["KM", "Comoros", "+269"],
    ["CG", "Congo - Brazzaville", "+242"],
    ["CD", "Congo - Kinshasa", "+243"],
    ["CK", "Cook Islands", "+682"],
    ["CR", "Costa Rica", "+506"],
    ["CI", "Côte d’Ivoire", "+225"],
    ["HR", "Croatia", "+385"],
    ["CU", "Cuba", "+53"],
    ["CW", "Curaçao", "+599"],
    ["CY", "Cyprus", "+357"],
    ["CZ", "Czech Republic", "+420"],
    ["DK", "Denmark", "+45"],
    ["DJ", "Djibouti", "+253"],
    ["DM", "Dominica", "+1"],
    ["DO", "Dominican Republic", "+1"],
    ["EC", "Ecuador", "+593"],
    ["EG", "Egypt", "+20"],
    ["SV", "El Salvador", "+503"],
    ["GQ", "Equatorial Guinea", "+240"],
    ["ER", "Eritrea", "+291"],
    ["EE", "Estonia", "+372"],
    ["SZ", "Eswatini", "+268"],
    ["ET", "Ethiopia", "+251"],
    ["FK", "Falkland Islands", "+500"],
    ["FO", "Faroe Islands", "+298"],
    ["FJ", "Fiji", "+679"],
    ["FI", "Finland", "+358"],
    ["FR", "France", "+33"],
    ["GF", "French Guiana", "+594"],
    ["PF", "French Polynesia", "+689"],
    ["GA", "Gabon", "+241"],
    ["GM", "Gambia", "+220"],
    ["GE", "Georgia", "+995"],
    ["DE", "Germany", "+49"],
    ["GH", "Ghana", "+233"],
    ["GI", "Gibraltar", "+350"],
    ["GR", "Greece", "+30"],
    ["GL", "Greenland", "+299"],
    ["GD", "Grenada", "+1"],
    ["GP", "Guadeloupe", "+590"],
    ["GU", "Guam", "+1"],
    ["GT", "Guatemala", "+502"],
    ["GG", "Guernsey", "+44"],
    ["GN", "Guinea", "+224"],
    ["GW", "Guinea-Bissau", "+245"],
    ["GY", "Guyana", "+592"],
    ["HT", "Haiti", "+509"],
    ["HN", "Honduras", "+504"],
    ["HK", "Hong Kong", "+852"],
    ["HU", "Hungary", "+36"],
    ["IS", "Iceland", "+354"],
    ["IN", "India", "+91"],
    ["ID", "Indonesia", "+62"],
    ["IR", "Iran", "+98"],
    ["IQ", "Iraq", "+964"],
    ["IE", "Ireland", "+353"],
    ["IM", "Isle of Man", "+44"],
    ["IL", "Israel", "+972"],
    ["IT", "Italy", "+39"],
    ["JM", "Jamaica", "+1"],
    ["JP", "Japan", "+81"],
    ["JE", "Jersey", "+44"],
    ["JO", "Jordan", "+962"],
    ["KZ", "Kazakhstan", "+7"],
    ["KE", "Kenya", "+254"],
    ["KI", "Kiribati", "+686"],
    ["XK", "Kosovo", "+383"],
    ["KW", "Kuwait", "+965"],
    ["KG", "Kyrgyzstan", "+996"],
    ["LA", "Laos", "+856"],
    ["LV", "Latvia", "+371"],
    ["LB", "Lebanon", "+961"],
    ["LS", "Lesotho", "+266"],
    ["LR", "Liberia", "+231"],
    ["LY", "Libya", "+218"],
    ["LI", "Liechtenstein", "+423"],
    ["LT", "Lithuania", "+370"],
    ["LU", "Luxembourg", "+352"],
    ["MO", "Macau", "+853"],
    ["MG", "Madagascar", "+261"],
    ["MW", "Malawi", "+265"],
    ["MY", "Malaysia", "+60"],
    ["MV", "Maldives", "+960"],
    ["ML", "Mali", "+223"],
    ["MT", "Malta", "+356"],
    ["MH", "Marshall Islands", "+692"],
    ["MQ", "Martinique", "+596"],
    ["MR", "Mauritania", "+222"],
    ["MU", "Mauritius", "+230"],
    ["YT", "Mayotte", "+262"],
    ["MX", "Mexico", "+52"],
    ["FM", "Micronesia", "+691"],
    ["MD", "Moldova", "+373"],
    ["MC", "Monaco", "+377"],
    ["MN", "Mongolia", "+976"],
    ["ME", "Montenegro", "+382"],
    ["MS", "Montserrat", "+1"],
    ["MA", "Morocco", "+212"],
    ["MZ", "Mozambique", "+258"],
    ["MM", "Myanmar", "+95"],
    ["NA", "Namibia", "+264"],
    ["NR", "Nauru", "+674"],
    ["NP", "Nepal", "+977"],
    ["NL", "Netherlands", "+31"],
    ["NC", "New Caledonia", "+687"],
    ["NZ", "New Zealand", "+64"],
    ["NI", "Nicaragua", "+505"],
    ["NE", "Niger", "+227"],
    ["NG", "Nigeria", "+234"],
    ["NU", "Niue", "+683"],
    ["NF", "Norfolk Island", "+672"],
    ["KP", "North Korea", "+850"],
    ["MK", "North Macedonia", "+389"],
    ["MP", "Northern Mariana Islands", "+1"],
    ["NO", "Norway", "+47"],
    ["OM", "Oman", "+968"],
    ["PK", "Pakistan", "+92"],
    ["PW", "Palau", "+680"],
    ["PS", "Palestine", "+970"],
    ["PA", "Panama", "+507"],
    ["PG", "Papua New Guinea", "+675"],
    ["PY", "Paraguay", "+595"],
    ["PE", "Peru", "+51"],
    ["PH", "Philippines", "+63"],
    ["PL", "Poland", "+48"],
    ["PT", "Portugal", "+351"],
    ["PR", "Puerto Rico", "+1"],
    ["QA", "Qatar", "+974"],
    ["RE", "Réunion", "+262"],
    ["RO", "Romania", "+40"],
    ["RU", "Russia", "+7"],
    ["RW", "Rwanda", "+250"],
    ["WS", "Samoa", "+685"],
    ["SM", "San Marino", "+378"],
    ["ST", "São Tomé & Príncipe", "+239"],
    ["SA", "Saudi Arabia", "+966"],
    ["SN", "Senegal", "+221"],
    ["RS", "Serbia", "+381"],
    ["SC", "Seychelles", "+248"],
    ["SL", "Sierra Leone", "+232"],
    ["SG", "Singapore", "+65"],
    ["SX", "Sint Maarten", "+1"],
    ["SK", "Slovakia", "+421"],
    ["SI", "Slovenia", "+386"],
    ["SB", "Solomon Islands", "+677"],
    ["SO", "Somalia", "+252"],
    ["ZA", "South Africa", "+27"],
    ["KR", "South Korea", "+82"],
    ["SS", "South Sudan", "+211"],
    ["ES", "Spain", "+34"],
    ["LK", "Sri Lanka", "+94"],
    ["BL", "St Barthélemy", "+590"],
    ["SH", "St Helena", "+290"],
    ["KN", "St Kitts & Nevis", "+1"],
    ["LC", "St Lucia", "+1"],
    ["MF", "St Martin", "+590"],
    ["PM", "St Pierre & Miquelon", "+508"],
    ["VC", "St Vincent & Grenadines", "+1"],
    ["SD", "Sudan", "+249"],
    ["SR", "Suriname", "+597"],
    ["SJ", "Svalbard & Jan Mayen", "+47"],
    ["SE", "Sweden", "+46"],
    ["CH", "Switzerland", "+41"],
    ["SY", "Syria", "+963"],
    ["TW", "Taiwan", "+886"],
    ["TJ", "Tajikistan", "+992"],
    ["TZ", "Tanzania", "+255"],
    ["TH", "Thailand", "+66"],
    ["TL", "Timor-Leste", "+670"],
    ["TG", "Togo", "+228"],
    ["TK", "Tokelau", "+690"],
    ["TO", "Tonga", "+676"],
    ["TT", "Trinidad & Tobago", "+1"],
    ["TN", "Tunisia", "+216"],
    ["TR", "Turkey", "+90"],
    ["TM", "Turkmenistan", "+993"],
    ["TC", "Turks & Caicos Islands", "+1"],
    ["TV", "Tuvalu", "+688"],
    ["UG", "Uganda", "+256"],
    ["UA", "Ukraine", "+380"],
    ["AE", "United Arab Emirates", "+971"],
    ["GB", "United Kingdom", "+44"],
    ["US", "United States", "+1"],
    ["UY", "Uruguay", "+598"],
    ["VI", "US Virgin Islands", "+1"],
    ["UZ", "Uzbekistan", "+998"],
    ["VU", "Vanuatu", "+678"],
    ["VA", "Vatican City", "+39"],
    ["VE", "Venezuela", "+58"],
    ["VN", "Vietnam", "+84"],
    ["WF", "Wallis & Futuna", "+681"],
    ["EH", "Western Sahara", "+212"],
    ["YE", "Yemen", "+967"],
    ["ZM", "Zambia", "+260"],
    ["ZW", "Zimbabwe", "+263"],
    ["AX", "Åland Islands", "+358"],
  ];

  const preferredCountryIsos = [
    "GB", "US", "DE", "ES", "FR", "BR", "PT", "TH", "ID", "MY", "PH",
    "AE", "CA", "AU", "MX", "AR", "CL", "CO", "IN", "NG", "ZA", "TR",
    "RU", "KZ",
  ];
  const flagFor = (iso) =>
    [...iso].map((letter) => String.fromCodePoint(letter.charCodeAt(0) + 127397)).join("");
  const allCountries = countryData.map(([iso, name, dial]) => ({
    iso,
    flag: flagFor(iso),
    name,
    dial,
  }));
  const countriesByIso = new Map(allCountries.map((country) => [country.iso, country]));
  const preferredCountries = preferredCountryIsos
    .map((iso) => countriesByIso.get(iso))
    .filter(Boolean);
  const preferredSet = new Set(preferredCountryIsos);
  const countries = [
    ...preferredCountries,
    ...allCountries.filter((country) => !preferredSet.has(country.iso)),
  ];

  const countryByIso = (iso) =>
    countries.find((country) => country.iso === String(iso || "").toUpperCase());

  const closePicker = (picker) => {
    const code = picker.querySelector("[data-phone-code]");
    const toggle = picker.querySelector("[data-phone-toggle]");
    const search = picker.querySelector("[data-phone-search]");
    const empty = picker.querySelector("[data-phone-empty]");
    code?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    if (search) search.value = "";
    picker.querySelectorAll("[data-phone-option]").forEach((option) => {
      option.hidden = false;
    });
    if (empty) empty.hidden = true;
  };

  const updateValue = (picker) => {
    const input = picker.querySelector("[data-phone-input]");
    const full = picker.querySelector("[data-phone-full]");
    const countryInput = picker.querySelector("[data-phone-country]");
    const country = countryByIso(picker.dataset.phoneIso) || countries[0];
    const localNumber = input?.value.trim() || "";

    if (full) {
      full.value = localNumber.startsWith("+")
        ? localNumber
        : `${country.dial}${localNumber ? ` ${localNumber}` : ""}`;
    }
    if (countryInput) countryInput.value = country.iso;
  };

  const setCountry = (picker, country) => {
    const flag = picker.querySelector("[data-phone-flag]");
    const dial = picker.querySelector("[data-phone-dial]");
    const toggle = picker.querySelector("[data-phone-toggle]");
    const options = picker.querySelectorAll("[data-phone-option]");

    picker.dataset.phoneIso = country.iso;
    if (flag) flag.textContent = country.flag;
    if (dial) dial.textContent = country.dial;
    toggle?.setAttribute(
      "aria-label",
      `Country code, ${country.name} ${country.dial}`,
    );

    options.forEach((option) => {
      const isSelected = option.dataset.iso === country.iso;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", String(isSelected));
    });

    updateValue(picker);
  };

  const openPicker = (picker) => {
    document.querySelectorAll("[data-phone-picker]").forEach((otherPicker) => {
      if (otherPicker !== picker) closePicker(otherPicker);
    });

    const code = picker.querySelector("[data-phone-code]");
    const toggle = picker.querySelector("[data-phone-toggle]");
    code?.classList.add("is-open");
    toggle?.setAttribute("aria-expanded", "true");
  };

  document.querySelectorAll("[data-phone-picker]").forEach((picker) => {
    const menu = picker.querySelector("[data-phone-menu]");
    const optionsContainer = picker.querySelector("[data-phone-options]");
    const toggle = picker.querySelector("[data-phone-toggle]");
    const input = picker.querySelector("[data-phone-input]");
    const search = picker.querySelector("[data-phone-search]");
    const empty = picker.querySelector("[data-phone-empty]");
    const initialCountry = countryByIso(picker.dataset.phoneIso) || countries[0];

    if (!menu || !optionsContainer || !toggle || !input || !search || !empty) return;

    countries.forEach((country) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "phone-code__option";
      option.dataset.phoneOption = "";
      option.dataset.iso = country.iso;
      option.dataset.search = `${country.name} ${country.iso} ${country.dial}`.toLowerCase();
      option.setAttribute("role", "option");
      option.innerHTML = `
        <span class="phone-code__flag" aria-hidden="true">${country.flag}</span>
        <span class="phone-code__option-name">${country.name}</span>
        <span class="phone-code__option-dial">${country.dial}</span>
      `;
      option.addEventListener("click", () => {
        setCountry(picker, country);
        closePicker(picker);
        input.focus();
      });
      optionsContainer.appendChild(option);
    });

    setCountry(picker, initialCountry);

    toggle.addEventListener("click", () => {
      const isOpen = picker
        .querySelector("[data-phone-code]")
        ?.classList.contains("is-open");
      if (isOpen) {
        closePicker(picker);
      } else {
        openPicker(picker);
      }
    });

    toggle.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      openPicker(picker);
      search.focus();
    });

    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let visibleCount = 0;
      menu.querySelectorAll("[data-phone-option]").forEach((option) => {
        const isVisible = !query || option.dataset.search.includes(query);
        option.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });
      empty.hidden = visibleCount !== 0;
    });

    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closePicker(picker);
        toggle.focus();
        return;
      }
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      event.stopPropagation();
      menu.querySelector("[data-phone-option]:not([hidden])")?.focus();
    });

    menu.addEventListener("keydown", (event) => {
      const options = [...menu.querySelectorAll("[data-phone-option]:not([hidden])")];
      const currentIndex = options.indexOf(document.activeElement);
      let nextIndex = currentIndex;

      if (event.key === "ArrowDown") nextIndex = Math.min(currentIndex + 1, options.length - 1);
      if (event.key === "ArrowUp") nextIndex = Math.max(currentIndex - 1, 0);
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = options.length - 1;
      if (event.key === "Escape") {
        closePicker(picker);
        toggle.focus();
        return;
      }
      if (nextIndex === currentIndex || nextIndex < 0) return;
      event.preventDefault();
      options[nextIndex]?.focus();
    });

    input.addEventListener("input", () => updateValue(picker));
    picker.closest("form")?.addEventListener("reset", () => {
      window.setTimeout(() => setCountry(picker, initialCountry), 0);
    });
  });

  document.addEventListener("click", (event) => {
    document.querySelectorAll("[data-phone-picker]").forEach((picker) => {
      if (!picker.contains(event.target)) closePicker(picker);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll("[data-phone-picker]").forEach(closePicker);
  });
})();
