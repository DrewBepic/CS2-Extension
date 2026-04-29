chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === "ADD_SKIN") {
		fetch("http://localhost:3000/add-skin", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(msg.data),
		})
			.then((res) => res.json())
			.then((result) => sendResponse(result))
			.catch((err) => sendResponse({ success: false, message: err.message }));

		return true;
	}

	if (msg.type === "GET_CSFLOAT_INVENTORY") {
		fetch(`http://localhost:3000/get-csfloat-inventory?apiKey=${msg.apiKey}`)
			.then((res) => res.json())
			.then((result) => sendResponse(result))
			.catch((err) => sendResponse({ success: false, message: err.message }));

		return true;
	}

	if (msg.type === "GET_LIS_PRICES") {
		fetch(`http://localhost:3000/get-lis-prices?apiKey=${msg.apiKey}&skinName=${msg.skinName}`)
			.then((res) => res.json())
			.then((result) => sendResponse(result))
			.catch((err) => sendResponse({ success: false, message: err.message }));

		return true;
	}

	if (msg.type === "SET_SKIN_DESCRIPTION") {
		fetch(`http://localhost:3000/set-skin-description?apiKey=${msg.apiKey}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: msg.id, description: msg.description }),
		})
			.then((res) => res.json())
			.then((result) => sendResponse(result))
			.catch((err) => sendResponse({ success: false, message: err.message }));

		return true;
	}
});
