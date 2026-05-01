import express from "express";
import { skins } from "./config/mongoCollections.js";
import cors from "cors";

const app = express();
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Access-Control-Request-Private-Network"],
	}),
);

// Handle the PNA preflight
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Private-Network", "true");
	if (req.method === "OPTIONS") return res.sendStatus(204);
	next();
});
app.use(express.json());

app.post("/add-skin", async (req, res) => {
	try {
		const skin = req.body;
		const skinCollection = await skins();
		const existingSkin = await skinCollection.findOne({ myid: skin.myid });
		if (existingSkin) {
			res.json({ success: false, message: "Skin with this ID already exists." });
		} else {
			const result = await skinCollection.insertOne(skin);
			res.json({ success: true, id: result.insertedId });
		}
	} catch (err) {
		console.log("Error inserting skin:", err);
		res.status(500).json({ success: false, message: err.message });
	}
});

app.get("/get-csfloat-inventory", async (req, res) => {
	try {
		const csfloatApiKey = req.query.apiKey;
		if (!csfloatApiKey) {
			return res.status(400).json({ success: false, message: "API key is required." });
		}
		let url = `https://csfloat.com/api/v1/users/76561199020440394/stall?limit=1000&sort_by=highest_price`;
		const response = await fetch(url, {
			headers: {
				Authorization: csfloatApiKey,
				Accept: "application/json",
				"User-Agent": "Mozilla/5.0",
			},
		});
		const data = await response.json();
		res.json({ success: true, data });
	} catch (err) {
		console.log("Error fetching CSFloat inventory:", err);
		res.status(500).json({ success: false, message: err.message });
	}
});

app.get("/get-lis-prices", async (req, res) => {
	try {
		const lisSkinsApiKey = req.query.apiKey;
		if (!lisSkinsApiKey) {
			return res.status(400).json({ success: false, message: "API key is required." });
		}
		const skinNames = req.query["names[]"];
		const namesArray = Array.isArray(skinNames) ? skinNames : [skinNames];
		let url = `https://api.lis-skins.com/v1/market/search?game=csgo&sort_by=lowest_price`;
		for (const name of namesArray) {
			url += `&names[]=${encodeURIComponent(name)}`;
		}
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: lisSkinsApiKey,
			},
		});
		const data = await response.json();
		res.json({ success: true, data });
	} catch (err) {
		console.log("Error fetching LIS prices:", err);
		res.status(500).json({ success: false, message: err.message });
	}
});

app.patch("/set-skin-description", async (req, res) => {
	const { id, description } = req.body;
	const csfloatApiKey = req.query.apiKey;
	if (!csfloatApiKey) {
		return res.status(400).json({ success: false, message: "API key is required." });
	}
	try {
		let url = `https://csfloat.com/api/v1/listings/${id}`;
		const response = await fetch(url, {
			method: "PATCH",
			headers: {
				Authorization: csfloatApiKey,
				"Content-Type": "application/json",
				"User-Agent": "Mozilla/5.0",
			},
			body: JSON.stringify({ description: description }),
		});
		const data = await response.json();
		if (!response.ok) {
			return res.status(response.status).json({ success: false, message: data });
		}
		res.json({ success: true, message: "Description updated successfully." });
	} catch (err) {
		console.log("Error updating skin description:", err);
		res.status(500).json({ success: false, message: err.message });
	}
});

app.listen(3000, () => {
	console.log("Server running at http://localhost:3000");
});
