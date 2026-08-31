(() => {
  "use strict";

  const countries = [
    { iso: "GB", flag: "🇬🇧", name: "United Kingdom", dial: "+44" },
    { iso: "US", flag: "🇺🇸", name: "United States", dial: "+1" },
    { iso: "DE", flag: "🇩🇪", name: "Germany", dial: "+49" },
    { iso: "ES", flag: "🇪🇸", name: "Spain", dial: "+34" },
    { iso: "FR", flag: "🇫🇷", name: "France", dial: "+33" },
    { iso: "BR", flag: "🇧🇷", name: "Brazil", dial: "+55" },
    { iso: "PT", flag: "🇵🇹", name: "Portugal", dial: "+351" },
    { iso: "TH", flag: "🇹🇭", name: "Thailand", dial: "+66" },
    { iso: "ID", flag: "🇮🇩", name: "Indonesia", dial: "+62" },
    { iso: "MY", flag: "🇲🇾", name: "Malaysia", dial: "+60" },
    { iso: "PH", flag: "🇵🇭", name: "Philippines", dial: "+63" },
    { iso: "AE", flag: "🇦🇪", name: "United Arab Emirates", dial: "+971" },
    { iso: "CA", flag: "🇨🇦", name: "Canada", dial: "+1" },
    { iso: "AU", flag: "🇦🇺", name: "Australia", dial: "+61" },
    { iso: "MX", flag: "🇲🇽", name: "Mexico", dial: "+52" },
    { iso: "AR", flag: "🇦🇷", name: "Argentina", dial: "+54" },
    { iso: "CL", flag: "🇨🇱", name: "Chile", dial: "+56" },
    { iso: "CO", flag: "🇨🇴", name: "Colombia", dial: "+57" },
    { iso: "IN", flag: "🇮🇳", name: "India", dial: "+91" },
    { iso: "NG", flag: "🇳🇬", name: "Nigeria", dial: "+234" },
    { iso: "ZA", flag: "🇿🇦", name: "South Africa", dial: "+27" },
    { iso: "TR", flag: "🇹🇷", name: "Turkey", dial: "+90" },
    { iso: "RU", flag: "🇷🇺", name: "Russia", dial: "+7" },
    { iso: "KZ", flag: "🇰🇿", name: "Kazakhstan", dial: "+7" },
  ];

  const countryByIso = (iso) =>
    countries.find((country) => country.iso === String(iso || "").toUpperCase());

  const closePicker = (picker) => {
    const code = picker.querySelector("[data-phone-code]");
    const toggle = picker.querySelector("[data-phone-toggle]");
    code?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
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
    const toggle = picker.querySelector("[data-phone-toggle]");
    const input = picker.querySelector("[data-phone-input]");
    const initialCountry = countryByIso(picker.dataset.phoneIso) || countries[0];

    if (!menu || !toggle || !input) return;

    countries.forEach((country) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "phone-code__option";
      option.dataset.phoneOption = "";
      option.dataset.iso = country.iso;
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
      menu.appendChild(option);
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
      menu.querySelector('[aria-selected="true"]')?.focus();
    });

    menu.addEventListener("keydown", (event) => {
      const options = [...menu.querySelectorAll("[data-phone-option]")];
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
