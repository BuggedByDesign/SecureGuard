const express = require("express");
const axios = require("axios");
const base64url = require("base64url");

const router = express.Router();
const VT_KEY = process.env.VIRUSTOTAL_API_KEY;

router.post("/", async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid or missing URL." });
  }

  try {
    const submit = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url }),
      { headers: { "x-apikey": VT_KEY } }
    );

    const analysisId = submit.data.data.id;

    let completed = false;
    for (let i = 0; i < 6; i++) {
      const check = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        { headers: { "x-apikey": VT_KEY } }
      );
      if (check.data.data.attributes.status === "completed") {
        completed = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }

    if (!completed) {
      return res.status(504).json({ error: "Scan timeout. Try again later." });
    }

    const encodedUrl = base64url(url);
    const report = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
      { headers: { "x-apikey": VT_KEY } }
    );

    const attr = report.data.data.attributes;
    const stats = attr.last_analysis_stats;
    const results = attr.last_analysis_results;

    const detections = Object.entries(results)
      .filter(([, r]) => r.category === "malicious")
      .map(([engine, r]) => ({ engine, result: r.result }));

    const total =
      (stats.harmless || 0) +
      (stats.malicious || 0) +
      (stats.suspicious || 0) +
      (stats.undetected || 0);

    res.json({ stats, total, detections });
  } catch (err) {
    console.error("❌ URL scan error:", err.response?.data || err.message);
    res.status(500).json({ error: "Server error during URL scan." });
  }
});

module.exports = router;
