let lastUrl = location.href;

async function percentComparer() {
	const { csfloat_api_key } = await chrome.storage.local.get("csfloat_api_key");
	if (!csfloat_api_key) {
		console.warn("CSFloat API key not found. Please set it in the extension options.");
		return;
	}

	try {
		const result = await chrome.runtime.sendMessage({
			type: "GET_CSFLOAT_INVENTORY",
			apiKey: csfloat_api_key,
		});
		if (!result.success) {
			console.error("Failed to fetch CSFloat inventory:", result.message);
			return;
		}

		const csfloatData = result["data"]["data"];
		const csfloatDict = {};
		csfloatData.forEach((item) => {
			csfloatDict[item["item"]["market_hash_name"]] = item["price"] / 100;
		});
		// console.log(csfloatDict);

		const lists = document.querySelectorAll(".inventory");

		const list = lists[0];
		const priceElements = list.querySelectorAll(".price");
		const names = list.querySelectorAll(".name");

		priceElements.forEach((priceElement) => {
			const cardElement = priceElement.closest(".skin");
			if (cardElement.classList.contains("disabled")) return;

			const skinName = cardElement.dataset.name;
			const csfloatPrice = csfloatDict[skinName];

			if (csfloatPrice) {
				const lisPrice = Number(priceElement.textContent.trim().replace("$", ""));
				// console.log(csfloatPrice, lisPrice);
				const percent = lisPrice / csfloatPrice;
				// console.log(`${skinName}: ${percent * 100}% of CSFloat price`);
				cardElement.style.position = "relative";
				let label = cardElement.querySelector(".percent-label");
				if (!label) {
					label = document.createElement("div");
					label.className = "percent-label";
					label.style.cssText = `
                        position: absolute;
                        top: 5px;
                        right: 20px;
                        color: white;
                        font-size: 11px;
                        padding: 2px 5px;
                        border-radius: 4px;
                        z-index: 10;
                    `;
					cardElement.appendChild(label);
				}
				label.textContent = `${(percent * 100).toFixed(1)}%`;

				if (percent >= 0.93) {
					cardElement.style.backgroundColor = "rgba(117, 201, 117, 0.2)";
					cardElement.style.border = "2px solid green";
				} else {
					cardElement.style.backgroundColor = "rgba(141, 87, 87, 0.2)";
					cardElement.style.border = "2px solid red";
				}
			} else {
				cardElement.style.backgroundColor = "";
				cardElement.style.border = "";
			}
		});
	} catch (error) {
		console.error("Error fetching CSFloat inventory:", error);
	}
}

setTimeout(percentComparer, 3000);

setInterval(() => {
	if (location.href !== lastUrl) {
		lastUrl = location.href; //lastUrl var gets loaded in content\LisMarketPage.js
		console.log("Page changed, rescanning...");
		setTimeout(percentComparer, 3000);
	}
}, 500);
