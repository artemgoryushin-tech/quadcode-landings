const themeToggle = document.querySelector("[data-theme-toggle]");

const syncThemeLabel = () => {
	const label = themeToggle?.querySelector("span:first-child");
	if (!label) return;
	label.textContent = document.body.dataset.theme === "dark" ? "Mod gelap" : "Mod cerah";
};

syncThemeLabel();
themeToggle?.addEventListener("click", () => window.queueMicrotask(syncThemeLabel));

const malayCountryNames = {
	GB: "United Kingdom",
	US: "Amerika Syarikat",
	DE: "Jerman",
	ES: "Sepanyol",
	FR: "Perancis",
	BR: "Brazil",
	PT: "Portugal",
	TH: "Thailand",
	ID: "Indonesia",
	MY: "Malaysia",
	CN: "China",
	PH: "Filipina",
	AE: "Emiriah Arab Bersatu",
	CA: "Kanada",
	AU: "Australia",
	MX: "Mexico",
	AR: "Argentina",
	CL: "Chile",
	CO: "Colombia",
	IN: "India",
	NG: "Nigeria",
	ZA: "Afrika Selatan",
	TR: "Turkiye",
	RU: "Rusia",
	KZ: "Kazakhstan"
};

const localizePhoneOptions = () => {
	document.querySelectorAll("[data-phone-option]").forEach((option) => {
		const name = option.querySelector(".phone-code__option-name");
		const localizedName = malayCountryNames[option.dataset.iso];
		if (name && localizedName) name.textContent = localizedName;
	});
};

localizePhoneOptions();

const phoneMenu = document.querySelector("[data-phone-menu]");
if (phoneMenu) {
	new MutationObserver(localizePhoneOptions).observe(phoneMenu, { childList: true });
}
