require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

const MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

let quotaExceeded = false;

// Функцията, която генерира ревюта
async function generateProductReview(productName) {
  if (quotaExceeded) return { error: "Quota exceeded" };

  try {
    const prompt = `Write a professional expert review summary for the antivirus software named "${productName}". Include pros, cons, and a bottom line recommendation.`;

    const resp = await axios.post(API_URL, { inputs: prompt }, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    const output = Array.isArray(resp.data)
      ? resp.data[0]?.generated_text
      : resp.data.generated_text;

    if (!output) throw new Error("No output");

    return output.trim();
  } catch (err) {
    console.error("HuggingFace API error:", err.response?.data || err.message);
    if (err.response?.status === 429) {
      quotaExceeded = true;
      return { error: "Quota exceeded" };
    }
    return { error: "Internal server error" };
  }
}

router.post("/generate-description", async (req, res) => {
  const { productName } = req.body;
  if (!productName?.trim()) return res.status(400).json({ error: "Product name is required" });

  const result = await generateProductReview(productName);
  if (result.error) {
    if (result.error === "Quota exceeded") return res.status(429).json({ error: result.error });
    return res.status(500).json({ error: result.error });
  }

  res.json({ description: result });
});

module.exports = router;
