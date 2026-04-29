/**
 * RoomVerse AI — Express Backend
 * Serves static frontend + furniture model files (.glb)
 */

const express = require("express");
const path    = require("path");
const fs      = require("fs");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS headers for model-viewer XR session requirements ──
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy",   "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy",  "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy",  "cross-origin");
  next();
});

// ── Serve .glb files with correct MIME type ──────────────
express.static.mime.define({ "model/gltf-binary": ["glb"] });

// ── Static file serving ──────────────────────────────────
app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".glb")) {
      res.setHeader("Content-Type", "model/gltf-binary");
      res.setHeader("Cache-Control", "public, max-age=86400");
    }
  },
}));

// ── API: list available models ────────────────────────────
app.get("/api/models", (req, res) => {
  const modelsDir = path.join(__dirname, "public", "models");
  try {
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith(".glb"));
    res.json({ models: files, count: files.length });
  } catch (e) {
    res.json({ models: [], count: 0, error: "models directory not found" });
  }
});

// ── API: health check ─────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app:    "RoomVerse AI",
    time:   new Date().toISOString(),
  });
});

// ── 404 fallback: serve index.html (SPA behaviour) ───────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🏠  RoomVerse AI running at http://localhost:${PORT}`);
  console.log(`    Models served from /public/models/\n`);
});

module.exports = app;
