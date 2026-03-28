import express from 'express';
import { skins } from './config/mongoCollections.js';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Access-Control-Request-Private-Network"]
}));

// Handle the PNA preflight
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

app.post("/add-skin", async (req, res) => {
  try {
    const skin = req.body;
    const skinCollection = await skins();
    const  existingSkin = await skinCollection.findOne({ myid: skin.myid });
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
        "User-Agent": "Mozilla/5.0"
      }
    });
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    console.log("Error fetching CSFloat inventory:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});