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
});