// Vercel Serverless Function — /api/env
// Returns the OpenRouter API key from Vercel environment variables
export default function handler(req, res) {
  res.status(200).json({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "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"
  });
}