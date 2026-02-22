const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/servers", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.battlemetrics.com/servers?filter[game]=rust&sort=-players&page[size]=50"
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
