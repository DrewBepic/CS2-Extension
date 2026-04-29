async function setDescription() {
	// console.log("Setting description for skins...");
	const { csfloat_api_key } = await chrome.storage.local.get("csfloat_api_key");
	if (!csfloat_api_key) {
		console.warn("CSFloat API key not found. Please set it in the extension options.");
		return;
	}
	let result;
	try {
		result = await chrome.runtime.sendMessage({
			type: "GET_CSFLOAT_INVENTORY",
			apiKey: csfloat_api_key,
		});
		if (!result.success) {
			console.error("Failed to fetch CSFloat inventory:", result.message);
			return;
		}
	} catch (error) {
		console.error("Error occurred while fetching CSFloat inventory:", error);
	}

	if (!result || !result.data) {
		console.error("No result data available");
		return;
	}

	for (const item of result.data.data) {
		if (!item.description) {
			let result2 = await chrome.runtime.sendMessage({
				type: "SET_SKIN_DESCRIPTION",
				apiKey: csfloat_api_key,
				id: item.id,
				description: "I trade too",
			});
			console.log("Description updated for item:", item.id);
		}
	}
}

setTimeout(() => {
	setDescription();
}, 3000);
