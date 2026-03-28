const button = document.getElementById("insertBtn");
const statusDiv = document.getElementById("status");

button.addEventListener("click", async () => {
  statusDiv.textContent = "Inserting skin into Mongo...";
  console.log("Button clicked, sending request to server...");

  try {
    const response = await fetch("http://localhost:3000/add-skin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "AK-47 | Redline",
        price: 12.5,
        float: 0.08
      })
    });

    const data = await response.json();
    statusDiv.textContent = "Mongo Response: " + JSON.stringify(data);
  } catch (err) {
    statusDiv.textContent = "Error: " + err.message;
  }
});