const themeToggle = document.querySelector("[data-theme-toggle]");

const syncThemeLabel = () => {
	const label = themeToggle?.querySelector("span:first-child");
	if (!label) return;
	label.textContent = document.body.dataset.theme === "dark" ? "โหมดมืด" : "โหมดสว่าง";
};

syncThemeLabel();
themeToggle?.addEventListener("click", () => window.queueMicrotask(syncThemeLabel));

const thaiCountryNames = {
	GB: "สหราชอาณาจักร",
	US: "สหรัฐอเมริกา",
	DE: "เยอรมนี",
	ES: "สเปน",
	FR: "ฝรั่งเศส",
	BR: "บราซิล",
	PT: "โปรตุเกส",
	TH: "ประเทศไทย",
	ID: "อินโดนีเซีย",
	MY: "มาเลเซีย",
	CN: "จีน",
	PH: "ฟิลิปปินส์",
	AE: "สหรัฐอาหรับเอมิเรตส์",
	CA: "แคนาดา",
	AU: "ออสเตรเลีย",
	MX: "เม็กซิโก",
	AR: "อาร์เจนตินา",
	CL: "ชิลี",
	CO: "โคลอมเบีย",
	IN: "อินเดีย",
	NG: "ไนจีเรีย",
	ZA: "แอฟริกาใต้",
	TR: "ตุรกี",
	RU: "รัสเซีย",
	KZ: "คาซัคสถาน"
};

const localizePhoneOptions = () => {
	document.querySelectorAll("[data-phone-option]").forEach((option) => {
		const name = option.querySelector(".phone-code__option-name");
		const localizedName = thaiCountryNames[option.dataset.iso];
		if (name && localizedName) name.textContent = localizedName;
	});
};

localizePhoneOptions();

const phoneMenu = document.querySelector("[data-phone-menu]");
if (phoneMenu) {
	new MutationObserver(localizePhoneOptions).observe(phoneMenu, { childList: true });
}
