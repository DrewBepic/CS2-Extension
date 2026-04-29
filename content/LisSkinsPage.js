// let lastUrl = location.href;

function inputPriceOnSkinPage() {
	const lists = document.querySelectorAll(".skins-market-skins-table");

	lists.forEach((list) => {
		const priceElements = list.querySelectorAll(".price");
		let floats = list.querySelectorAll(".float");

		priceElements.forEach(async (priceElement, index) => {
			const cardElement = priceElement.closest(".item.row.market_item");
			const element = cardElement.querySelector(".price");
			let goodBuyPrice = (1.125 * Number(priceElement.innerText.replace(/[^0-9.]/g, ""))).toFixed(2);
			element.innerText = priceElement.innerText + " ($" + goodBuyPrice + ")";
		});
	});
}

setTimeout(inputPriceOnSkinPage, 500);

setInterval(() => {
	if (location.href !== lastUrl) {
		lastUrl = location.href; //lastUrl var gets loaded in content\LisMarketPage.js
		if (location.href.includes('__cf_chl_tk')) return;
		console.log("Page changed, rescanning...");
		setTimeout(inputPriceOnSkinPage, 3000);
	}
}, 500);
