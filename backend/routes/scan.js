const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const upload = multer({ dest: "uploads/" });
const VT_KEY = process.env.VIRUSTOTAL_API_KEY;

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const rs = fs.createReadStream(filePath);
    rs.on("data", (chunk) => hash.update(chunk));
    rs.on("end", () => resolve(hash.digest("hex")));
    rs.on("error", reject);
  });
}

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const filePath = req.file.path;

  try {
    const sha256 = await sha256File(filePath);
    let stats, results;

    try {
      const rpt = await axios.get(
        `https://www.virustotal.com/api/v3/files/${sha256}`,
        { headers: { "x-apikey": VT_KEY } }
      );
      stats = rpt.data.data.attributes.last_analysis_stats;
      results = rpt.data.data.attributes.last_analysis_results;
    } catch (err) {
      if (err.response?.status !== 404) throw err;

      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));
      const uploadResp = await axios.post(
        "https://www.virustotal.com/api/v3/files",
        form,
        { headers: { "x-apikey": VT_KEY, ...form.getHeaders() } }
      );

      const analysisId = uploadResp.data.data.id;

      let done = false;
      for (let i = 0; i < 6; i++) {
        const analysis = await axios.get(
          `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
          { headers: { "x-apikey": VT_KEY } }
        );
        if (analysis.data.data.attributes.status === "completed") {
          done = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 5000));
      }

      if (!done) {
        return res.status(504).json({ error: "Scan timeout. Try again later." });
      }

      const rpt2 = await axios.get(
        `https://www.virustotal.com/api/v3/files/${sha256}`,
        { headers: { "x-apikey": VT_KEY } }
      );
      stats = rpt2.data.data.attributes.last_analysis_stats;
      results = rpt2.data.data.attributes.last_analysis_results;
    }

    const detections = Object.entries(results)
      .filter(([, r]) => r.category === "malicious")
      .map(([engine, r]) => ({ engine, result: r.result }));

    const total =
      (stats.harmless || 0) +
      (stats.malicious || 0) +
      (stats.suspicious || 0) +
      (stats.undetected || 0);

    return res.json({ stats, total, detections });
  } catch (err) {
    console.error("❌ File scan error:", err.response?.data || err.message);
    res.status(500).json({ error: "Server error during file scan." });
  } finally {
    fs.unlink(filePath, () => {});
  }
});

module.exports = router;
