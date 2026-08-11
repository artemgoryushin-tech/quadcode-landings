const themeToggle = document.querySelector("[data-theme-toggle]");

const syncThemeLabel = () => {
	const label = themeToggle?.querySelector("span:first-child");
	if (!label) return;
	label.textContent = document.body.dataset.theme === "dark" ? "深色模式" : "浅色模式";
};

syncThemeLabel();
themeToggle?.addEventListener("click", () => window.queueMicrotask(syncThemeLabel));

const chineseCountryNames = {
	GB: "英国",
	US: "美国",
	DE: "德国",
	ES: "西班牙",
	FR: "法国",
	BR: "巴西",
	PT: "葡萄牙",
	TH: "泰国",
	ID: "印度尼西亚",
	MY: "马来西亚",
	CN: "中国",
	PH: "菲律宾",
	AE: "阿拉伯联合酋长国",
	CA: "加拿大",
	AU: "澳大利亚",
	MX: "墨西哥",
	AR: "阿根廷",
	CL: "智利",
	CO: "哥伦比亚",
	IN: "印度",
	NG: "尼日利亚",
	ZA: "南非",
	TR: "土耳其",
	RU: "俄罗斯",
	KZ: "哈萨克斯坦"
};

const localizePhoneOptions = () => {
	document.querySelectorAll("[data-phone-option]").forEach((option) => {
		const name = option.querySelector(".phone-code__option-name");
		const localizedName = chineseCountryNames[option.dataset.iso];
		if (name && localizedName) name.textContent = localizedName;
	});
};

localizePhoneOptions();

const phoneMenu = document.querySelector("[data-phone-menu]");
if (phoneMenu) {
	new MutationObserver(localizePhoneOptions).observe(phoneMenu, { childList: true });
}
