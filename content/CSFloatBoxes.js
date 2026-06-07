let lastUrlStall  = location.href;

// Cache the skins list so we only fetch once
let skinsCache = null;

async function getSkinsList() {
	if (skinsCache) return skinsCache;
	const res = await fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json");
	skinsCache = await res.json();
	return skinsCache;
}

async function getWeaponId(skinName) {
	const skins = await getSkinsList();

	return skins.find((s) => skinName.includes(s.name))?.weapon.weapon_id;
}

async function getPaintIndex(skinName) {
	const skins = await getSkinsList();
	return skins.find((s) => skinName.replace("Souvenir ", "") === s.name)?.paint_index;
}

async function scanPage() {
	const lists = document.querySelectorAll(".content-wrapper");
	for (const list of lists) {
		const skins = list.querySelectorAll(".flex-item");
		for (const skin of skins) {
			let category;
			let name = skin.querySelector(".header .item-name")?.textContent.trim();
			let float = skin.querySelector(".footer .wear")?.textContent.trim();
			float = parseFloat(float);
			let type = skin.querySelector(".header .subtext span")?.textContent.trim();
			let skinWear = skin.querySelector(".header .subtext")?.textContent.trim();

			if (float) {
				let maxFloat = 1;
				let minFloat = 0;
				if (skinWear.includes("Factory New")) {
					maxFloat = 0.07;
					minFloat = 0;
					if (float <= 0.01) {
						maxFloat = 0.01;
					} else if (float <= 0.03) {
						maxFloat = 0.03;
					}
				} else if (skinWear.includes("Minimal Wear")) {
					maxFloat = 0.15;
					minFloat = 0.07;
					if (float <= 0.08) {
						maxFloat = 0.08;
					} else if (float <= 0.09) {
						maxFloat = 0.09;
					} else if (float <= 0.1) {
						maxFloat = 0.1;
					}
				} else if (skinWear.includes("Field-Tested")) {
					maxFloat = 0.38;
					minFloat = 0.15;
					if (float <= 0.2) {
						maxFloat = 0.2;
					}
				} else if (skinWear.includes("Well-Worn")) {
					maxFloat = 0.45;
					minFloat = 0.38;
				} else if (skinWear.includes("Battle-Scarred")) {
					maxFloat = 1;
					minFloat = 0.45;
				}

				//Category 1: Normal, Category 2: StatTrak, Category 3: Souvenir
				category = 1;
				if (type) {
					if (type.includes("StatTrak™")) {
						category = 2;
					} else if (type.includes("Souvenir")) {
						category = 3;
					}
				}

				const paintIndex = await getPaintIndex(name); // ← fetch before building skinData
				const weaponId = await getWeaponId(name); // ← fetch before building skinData
				const cardElement = skin;
				if (cardElement.querySelector(".csfloat-link-btn")) continue;
				const csfloatBtn = document.createElement("a");
				csfloatBtn.className = "csfloat-link-btn";
				csfloatBtn.href = `https://csfloat.com/search?category=${category}&sort_by=lowest_price&min_float=${minFloat}&max_float=${maxFloat}&type=buy_now&def_index=${weaponId}&paint_index=${paintIndex}`;
				csfloatBtn.target = "_blank";
				csfloatBtn.style.cssText = `
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    z-index: 10;
                `;
				const img = document.createElement("img");
				img.src = "https://cdn.tradeupspy.com/img/logos/icon-csfloat.webp";
				img.style.cssText = `
                    width: 33px;
                    height: 33px;
                    border-radius: 4px;
                    display: block;
                `;

				csfloatBtn.appendChild(img);
				cardElement.style.position = "relative";
				cardElement.appendChild(csfloatBtn);
			}
		}
	}
}

let scanTimeout = null;

function observePage() {
    const observer = new MutationObserver(() => {
        clearTimeout(scanTimeout);
        scanTimeout = setTimeout(scanPage, 300);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

setTimeout(() => {
    scanPage();
    observePage();
}, 500);

setInterval(() => {
	if (location.href !== lastUrlStall ) {
		lastUrlStall  = location.href;
		if (location.href.includes("__cf_chl_tk")) return; // skip CF challenge
		console.log("Page changed, rescanning...");
		setTimeout(scanPage, 3000);
	}
}, 500);
