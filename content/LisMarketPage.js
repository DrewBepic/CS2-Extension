let lastUrl = location.href;

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

function scanPage() {
	const lists = document.querySelectorAll(".skins-market-skins-list");

	lists.forEach((list) => {
		let skins = list.querySelectorAll(".name-inner");
		const priceElements = list.querySelectorAll(".price");
		const infoBlocks = list.querySelectorAll(".skin-info");

		skins.forEach(async (skin, index) => {
			const price = priceElements[index]?.innerText;

			const infoItems = infoBlocks[index]?.querySelectorAll(".info-item");
			let float;
			let statrak;
			if (infoItems?.[1]?.innerText == "ST™") {
				statrak = true;
				float = infoItems?.[3]?.innerText;
			} else {
				statrak = false;
				float = infoItems?.[2]?.innerText;
			}
			const floatVal = parseFloat(float);
			const skinWear = skin.parentElement.querySelector(".name-exterior")?.innerText;
			const paintIndex = await getPaintIndex(skin.innerText); // ← fetch before building skinData
			const weaponId = await getWeaponId(skin.innerText); // ← fetch before building skinData

			const skinData = {
				myid: skin.innerText + skinWear + price + float,
				name: skin.innerText,
				wear: skinWear,
				price: price,
				float: floatVal,
				paintIndex: paintIndex,
				weaponId: weaponId,
				stattrak: statrak,
			};

			try {
				const result = await chrome.runtime.sendMessage({
					type: "ADD_SKIN",
					data: skinData,
				});

				const cardElement = skin.closest(".item.market_item");
				const priceElement = cardElement.querySelector(".price");
				let goodBuyPrice = (1.125 * Number(price.replace(/[^0-9.]/g, ""))).toFixed(2);
				priceElement.innerText = price + " ($" + goodBuyPrice + ")";

				let maxFloat = 1;
				let minFloat = 0;
				if (skinWear) {
					if (skinWear.includes("Factory New")) {
						maxFloat = 0.07;
						minFloat = 0;
						if (floatVal <= 0.01) {
							maxFloat = 0.01;
						} else if (floatVal <= 0.03) {
							maxFloat = 0.03;
						}
					} else if (skinWear.includes("Minimal Wear")) {
						maxFloat = 0.15;
						minFloat = 0.07;
						if (floatVal <= 0.08) {
							maxFloat = 0.08;
						} else if (floatVal <= 0.09) {
							maxFloat = 0.09;
						} else if (floatVal <= 0.1) {
							maxFloat = 0.1;
						}
					} else if (skinWear.includes("Field-Tested")) {
						maxFloat = 0.38;
						minFloat = 0.15;
						if (floatVal <= 0.2) {
							maxFloat = 0.2;
						}
					} else if (skinWear.includes("Well-Worn")) {
						maxFloat = 0.44;
						minFloat = 0.38;
					} else if (skinWear.includes("Battle-Scarred")) {
						maxFloat = 1;
						minFloat = 0.44;
					}

					// console.log(skin.innerText)
					let category;
					if (statrak) {
						category = 2;
					} else if (skin.innerText.toLowerCase().includes("souvenir")) {
						category = 3;
					} else {
						category = 1;
					}
					cardElement.querySelector(".paint-index-btn")?.remove();
					const btn = document.createElement("a");
					btn.className = "paint-index-btn";
					btn.href = `https://csfloat.com/search?category=${category}&sort_by=lowest_price&min_float=${minFloat}&max_float=${maxFloat}&type=buy_now&def_index=${weaponId}&paint_index=${paintIndex}`;
					btn.target = "_blank";
					btn.style.cssText = `
						position: absolute;
						top: 6px;
						right: 6px;
						z-index: 10;
					`;

					const img = document.createElement("img");
					img.src = "https://cdn.tradeupspy.com/img/logos/icon-csfloat.webp";
					img.style.cssText = `
						width: 24px;
						height: 24px;
						border-radius: 4px;
						display: block;
					`;

					btn.appendChild(img);
					cardElement.style.position = "relative";
					cardElement.appendChild(btn);
				}

				if (cardElement.querySelector(".sticker-list")) {
					cardElement.querySelector(".sticker-list").style.marginTop = "15px";
				}
				if (result?.success) {
					cardElement.style.backgroundColor = "rgba(117, 201, 117, 0.2)";
					cardElement.style.border = "2px solid green";
				} else {
					cardElement.style.backgroundColor = "rgba(141, 87, 87, 0.2)";
					cardElement.style.border = "2px solid red";
				}
			} catch (err) {
				console.error("Fetch error:", err);
			}
		});
	});
}

setTimeout(scanPage, 500);

setInterval(() => {
	if (location.href !== lastUrl) {
		lastUrl = location.href;
		if (location.href.includes('__cf_chl_tk')) return; // skip CF challenge
		console.log("Page changed, rescanning...");
		setTimeout(scanPage, 3000);
	}
}, 500);
