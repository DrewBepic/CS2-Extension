let lastUrl50to500 = location.href;

let lisPrices = {};
let currentTime = new Date();
const TEN_MINUTES = 10 * 60 * 1000;

async function FityToFaHuned() {
	if (new Date() - currentTime > TEN_MINUTES) {
		lisPrices = {};
		currentTime = new Date();
		console.log("Cache reset after 10 minutes");
	}
	const { lis_skins_api_key } = await chrome.storage.local.get("lis_skins_api_key");
	if (!lis_skins_api_key) {
		console.warn("LIS Skins API key not found. Please set it in the extension options.");
		return;
	}
	const contentWrapper = document.querySelector(".content-wrapper");
	if (!contentWrapper) return;

	const cards = contentWrapper.querySelectorAll("item-card");

	for (const card of cards) {
		if (card.querySelector(".header")?.style.backgroundColor) continue;
		const name = card.querySelector(".item-name")?.textContent?.trim();
		const subtext = card.querySelector(".subtext")?.textContent?.trim();
		const price = card.querySelector(".price")?.textContent?.trim();
		const floatVal = card.querySelector(".wear")?.textContent?.trim();

		let finalName = name;
		if (subtext.includes("Factory New")) {
			finalName = finalName + " (Factory New)";
		} else if (subtext.includes("Minimal Wear")) {
			finalName = finalName + " (Minimal Wear)";
		} else if (subtext.includes("Field-Tested")) {
			finalName = finalName + " (Field-Tested)";
		} else if (subtext.includes("Well-Worn")) {
			finalName = finalName + " (Well-Worn)";
		} else if (subtext.includes("Battle-Scarred")) {
			finalName = finalName + " (Battle-Scarred)";
		}
		if (subtext.includes("StatTrak")) {
			finalName = "StatTrak™ " + finalName;
		} else if (subtext.includes("Souvenir")) {
			finalName = "Souvenir " + finalName;
		}

		let lowestPrice = 0;
		let tester = 0;
		if (lisPrices[finalName]) {
			lowestPrice = lisPrices[finalName];
			tester = 1;
		} else {
			const result = await chrome.runtime.sendMessage({
				type: "GET_LIS_PRICES",
				apiKey: lis_skins_api_key,
				skinName: finalName,
			});
			try{
				lowestPrice = result.data.data[0]?.price || 0;
			} catch (error) {
				console.log(result);
				lowestPrice = 0;
			}
			lisPrices[finalName] = lowestPrice;
			tester = 2;
		}
		console.log(`Lowest price for ${finalName}: ${lowestPrice} gotten from ${tester}`);
		const cardPrice = parseFloat(price.replace(/[^0-9.]/g, ""));

		let color;
		if (cardPrice <= lowestPrice * 0.9) {
			color = "rgba(0, 255, 0, 0.2)";
		} else {
			color = "rgba(255, 0, 0, 0.2)";
		}

		const header = card.querySelector(".header");
		const footer = card.querySelector(".footer");
		const outerActions = card.querySelector(".outer-actions");

		if (header) header.style.backgroundColor = color;
		if (footer) footer.style.backgroundColor = color;
		if (outerActions) outerActions.style.backgroundColor = "transparent";
		card.style.backgroundColor = "";
	}
}

function shouldRun() {
	const url = new URL(window.location.href);
	const params = url.searchParams;

	return (
		url.pathname === "/search" &&
		params.get("sort_by") === "highest_discount" &&
		params.get("type") === "buy_now" &&
		Number(params.get("min_price")) === 5000 &&
		Number(params.get("max_price")) === 50000 &&
		Number(params.get("min_ref_qty")) === 20
	);
}
function observeAndRun() {
    let scanTimeout = null;
    const observer = new MutationObserver(() => {
        clearTimeout(scanTimeout);
        scanTimeout = setTimeout(FityToFaHuned, 300);
    });

    const contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) {
        observer.observe(contentWrapper, {
            childList: true,
            subtree: true,
        });
    }
}

setTimeout(() => {
    if (shouldRun()) {
        FityToFaHuned();
        observeAndRun();
    } else {
        console.log("Initial load skipped:", location.href);
    }
}, 500);

setInterval(() => {
	if (location.href !== lastUrl50to500) {
		lastUrl50to500 = location.href;
		console.log("Page changed");

		setTimeout(() => {
			if (shouldRun()) {
				console.log("Conditions met, scanning...");
				FityToFaHuned();
			} else {
				console.log("Conditions NOT met:", location.href);
			}
		}, 3000);
	}
}, 500);
