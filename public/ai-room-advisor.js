/**
 * RoomVerse AI — Room Advisor Feature
 * =====================================
 * Adds a full AI-powered room analysis section to your page.
 * User uploads a room photo → Claude Vision analyzes it →
 * Returns style, colors, mood, and specific furniture recommendations
 * that link back to your product catalog.
 *
 * HOW TO USE:
 * 1. Add this in your index.html before </body>:
 *    <script src="ai-room-advisor.js"></script>
 *
 * 2. Add a nav link so users can reach it:
 *    <a href="#ai-advisor">AI Advisor</a>
 *
 * 3. That's it! The section auto-injects itself before the footer.
 */

// ─── CONFIG ────────────────────────────────────────────────────────────────
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are RoomVerse AI, an expert interior design consultant with 20 years of experience styling luxury homes across India and globally.

When given a room photo, you analyze it deeply and provide a structured JSON response ONLY — no markdown, no preamble, no explanation outside the JSON.

Respond with this exact JSON shape:
{
  "roomType": "Living Room | Bedroom | Office | Dining Room | etc",
  "currentStyle": "e.g. Minimalist Scandinavian",
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "colorMoodDescription": "2-3 sentence description of the current color palette and mood",
  "styleAnalysis": "3-4 sentence analysis of the current room style, what works, what could be elevated",
  "recommendations": [
    {
      "category": "Seating | Lighting | Tables | Storage | Decor | Bedding | Rugs",
      "item": "Specific product name e.g. Wabi-Sabi Accent Chair",
      "reason": "1-2 sentences explaining exactly why this fits the room",
      "priceRange": "₹8,000 – ₹15,000",
      "urgency": "Essential | Recommended | Optional",
      "searchKeyword": "armchair"
    }
  ],
  "designTip": "One actionable pro tip the homeowner can do today",
  "overallScore": 72,
  "scoreLabel": "Good bones, needs personality"
}

Provide exactly 5 recommendations. Be specific to what you actually see in the room. Reference actual colors, furniture pieces, and spatial issues you observe. Sound like a real consultant, not a generic AI.`;
// ───────────────────────────────────────────────────────────────────────────

// Inject CSS
const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── SECTION ── */
#ai-advisor {
  padding: 6rem 0;
  background:
    repeating-linear-gradient(91deg, transparent 0px, rgba(196,124,53,0.03) 1px, transparent 2px, transparent 36px),
    linear-gradient(180deg, #130b05 0%, #0f0a06 100%);
  border-top: 1px solid rgba(196,124,53,0.2);
  position: relative;
  overflow: hidden;
}
#ai-advisor::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232,184,75,0.5), transparent);
}

.advisor-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

.advisor-header { margin-bottom: 3rem; }

.advisor-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #e8b84b;
  margin-bottom: 0.75rem;
  text-shadow: 0 0 12px rgba(232,184,75,0.4);
}
.advisor-eyebrow::before {
  content: '';
  display: block;
  width: 24px; height: 1px;
  background: linear-gradient(90deg, transparent, #e8b84b);
}

.advisor-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 300;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #fff8ec;
  margin-bottom: 1rem;
}
.advisor-title em {
  font-style: italic;
  background: linear-gradient(135deg, #c47c35, #e8b84b, #f5dfa0, #c47c35);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: goldSheen 4s linear infinite;
}
@keyframes goldSheen {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.advisor-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  color: rgba(245,223,160,0.5);
  max-width: 520px;
  line-height: 1.7;
}

/* ── UPLOAD ZONE ── */
.advisor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: start;
}
@media (max-width: 900px) { .advisor-layout { grid-template-columns: 1fr; } }

.upload-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.upload-zone {
  border: 1.5px dashed rgba(196,124,53,0.35);
  border-radius: 20px;
  background:
    repeating-linear-gradient(92deg, transparent 0, rgba(196,124,53,0.025) 1px, transparent 2px, transparent 24px),
    linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 50%),
    #1e1208;
  aspect-ratio: 4/3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.upload-zone:hover, .upload-zone.drag-over {
  border-color: rgba(196,124,53,0.7);
  background:
    repeating-linear-gradient(92deg, transparent 0, rgba(196,124,53,0.04) 1px, transparent 2px, transparent 24px),
    linear-gradient(160deg, rgba(255,255,255,0.05) 0%, transparent 50%),
    #221508;
  box-shadow: 0 0 40px rgba(196,124,53,0.15), inset 0 0 40px rgba(196,124,53,0.05);
}
.upload-zone.has-image { border-style: solid; border-color: rgba(196,124,53,0.5); }

.upload-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(196,124,53,0.1);
  border: 1px solid rgba(196,124,53,0.25);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1rem;
  color: #c47c35;
  transition: all 0.3s ease;
}
.upload-zone:hover .upload-icon {
  background: rgba(196,124,53,0.2);
  box-shadow: 0 0 20px rgba(196,124,53,0.3);
}
.upload-icon svg { width: 24px; height: 24px; }

.upload-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(245,223,160,0.6);
  margin-bottom: 0.35rem;
  text-align: center;
}
.upload-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: rgba(245,223,160,0.3);
  text-align: center;
}

#room-image-input { display: none; }

/* Preview image inside zone */
.upload-preview {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 18px;
}
.upload-preview-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10,6,3,0.2) 0%, rgba(10,6,3,0.6) 100%);
  border-radius: 18px;
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
}
.preview-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  color: rgba(245,223,160,0.7);
  font-weight: 500;
}
.preview-change {
  margin-left: auto;
  padding: 0.3rem 0.8rem;
  background: rgba(196,124,53,0.25);
  border: 1px solid rgba(196,124,53,0.4);
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #e8b84b;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.25s ease;
}
.preview-change:hover { background: rgba(196,124,53,0.4); }

/* Analyze button */
.btn-analyze {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #5c2d14 0%, #c47c35 55%, #d4962c 100%);
  background-size: 200% 100%;
  color: #0f0a06;
  border: none;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 4px 24px rgba(196,124,53,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}
.btn-analyze::before {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: skewX(-20deg);
  transition: left 0.5s ease;
}
.btn-analyze:hover::before { left: 150%; }
.btn-analyze:hover:not(:disabled) {
  background-position: 100% 0;
  transform: translateY(-2px);
  box-shadow: 0 8px 36px rgba(196,124,53,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
}
.btn-analyze:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
.btn-analyze svg { width: 20px; height: 20px; }

/* Analyzing state */
.analyzing-ring {
  width: 20px; height: 20px;
  border: 2px solid rgba(15,10,6,0.3);
  border-top-color: #0f0a06;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: none;
}
@keyframes spin { to { transform: rotate(360deg); } }
.btn-analyze.loading .analyzing-ring { display: block; }
.btn-analyze.loading .btn-analyze-icon { display: none; }

.upload-tips {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.tip-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  color: rgba(245,223,160,0.35);
}
.tip-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #c47c35;
  flex-shrink: 0;
  opacity: 0.5;
}

/* ── RESULTS PANEL ── */
.results-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 400px;
}

/* Empty state */
.results-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  border: 1px solid rgba(196,124,53,0.12);
  border-radius: 20px;
  background: rgba(196,124,53,0.02);
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}
.results-empty-icon {
  font-size: 2.5rem;
  opacity: 0.3;
}
.results-empty p {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: rgba(245,223,160,0.3);
  line-height: 1.6;
}

/* Score card */
.score-card {
  background:
    linear-gradient(160deg, rgba(255,255,255,0.05) 0%, transparent 40%),
    linear-gradient(135deg, #2a1508, #1a0d06);
  border: 1px solid rgba(196,124,53,0.25);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}
.score-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(91deg, transparent 0, rgba(196,124,53,0.02) 1px, transparent 2px, transparent 28px);
  pointer-events: none;
}

.score-ring-wrap {
  flex-shrink: 0;
  position: relative;
  width: 80px; height: 80px;
}
.score-ring-wrap svg {
  transform: rotate(-90deg);
  width: 80px; height: 80px;
}
.score-ring-bg { fill: none; stroke: rgba(196,124,53,0.15); stroke-width: 5; }
.score-ring-fill {
  fill: none;
  stroke: url(#goldGrad);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.score-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #e8b84b;
}

.score-info { flex: 1; }
.score-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #f5dfa0;
  margin-bottom: 0.25rem;
}
.room-type-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  background: rgba(196,124,53,0.15);
  border: 1px solid rgba(196,124,53,0.3);
  border-radius: 100px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c47c35;
  margin-bottom: 0.5rem;
}
.score-style {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  color: rgba(245,223,160,0.4);
}

/* Color palette */
.color-palette-card {
  background: linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 40%), #1c1007;
  border: 1px solid rgba(196,124,53,0.18);
  border-radius: 16px;
  padding: 1.25rem;
}
.card-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(245,223,160,0.35);
  margin-bottom: 0.75rem;
}
.color-swatches {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.color-swatch {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  flex-shrink: 0;
}
.color-mood {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: rgba(245,223,160,0.45);
  line-height: 1.6;
}

/* Style analysis */
.analysis-card {
  background: linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 40%), #1c1007;
  border: 1px solid rgba(196,124,53,0.18);
  border-radius: 16px;
  padding: 1.25rem;
}
.analysis-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  color: rgba(245,223,160,0.55);
  line-height: 1.75;
}

/* Recommendations */
.recs-section { display: flex; flex-direction: column; gap: 0.75rem; }
.recs-heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f5dfa0;
  margin-bottom: 0.25rem;
}

.rec-card {
  background:
    linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 40%),
    #1e1208;
  border: 1px solid rgba(196,124,53,0.18);
  border-radius: 14px;
  padding: 1.1rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.25s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;
}
.rec-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
}
.rec-card:hover {
  border-color: rgba(196,124,53,0.4);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(196,124,53,0.08);
}

.rec-urgency {
  flex-shrink: 0;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-top: 5px;
}
.rec-urgency.essential  { background: #e8b84b; box-shadow: 0 0 8px rgba(232,184,75,0.6); }
.rec-urgency.recommended { background: #c47c35; box-shadow: 0 0 8px rgba(196,124,53,0.5); }
.rec-urgency.optional   { background: rgba(196,124,53,0.3); }

.rec-body { flex: 1; min-width: 0; }
.rec-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}
.rec-item-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #f5dfa0;
  line-height: 1.2;
}
.rec-category {
  font-family: 'Outfit', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(196,124,53,0.6);
  white-space: nowrap;
  flex-shrink: 0;
}
.rec-reason {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  color: rgba(245,223,160,0.4);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}
.rec-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.rec-price {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  background: linear-gradient(90deg, #c47c35, #e8b84b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.rec-shop-link {
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(196,124,53,0.6);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.2s ease;
}
.rec-card:hover .rec-shop-link { color: #e8b84b; }
.rec-shop-link svg { width: 12px; height: 12px; }

/* Pro tip */
.tip-card {
  background:
    linear-gradient(135deg, rgba(196,124,53,0.12) 0%, rgba(196,124,53,0.04) 100%),
    #1c1007;
  border: 1px solid rgba(196,124,53,0.3);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}
.tip-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  line-height: 1.4;
}
.tip-content {}
.tip-heading {
  font-family: 'Outfit', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #e8b84b;
  margin-bottom: 0.3rem;
}
.tip-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: rgba(245,223,160,0.55);
  line-height: 1.65;
}

/* Error state */
.results-error {
  background: rgba(176,58,46,0.08);
  border: 1px solid rgba(176,58,46,0.25);
  border-radius: 14px;
  padding: 1.25rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: rgba(245,200,180,0.7);
  line-height: 1.6;
}

/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, rgba(196,124,53,0.06) 25%, rgba(196,124,53,0.12) 50%, rgba(196,124,53,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skel-card {
  border: 1px solid rgba(196,124,53,0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex; flex-direction: column; gap: 0.75rem;
  background: #1c1007;
}
.skel-line { height: 12px; }
.skel-line.w-60 { width: 60%; }
.skel-line.w-80 { width: 80%; }
.skel-line.w-40 { width: 40%; }
`;
document.head.appendChild(style);

// ─── HTML TEMPLATE ─────────────────────────────────────────────────────────
const section = document.createElement('section');
section.id = 'ai-advisor';
section.innerHTML = `
<div class="advisor-container">
  <div class="advisor-header">
    <div class="advisor-eyebrow">✦ AI Room Advisor</div>
    <h2 class="advisor-title">Design your room with <em>AI vision</em></h2>
    <p class="advisor-subtitle">Upload a photo of your room and our AI consultant will analyze your space, identify your style, and recommend the perfect furniture pieces.</p>
  </div>

  <div class="advisor-layout">

    <!-- LEFT: Upload -->
    <div class="upload-panel">
      <div class="upload-zone" id="upload-zone" onclick="document.getElementById('room-image-input').click()">
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
          </svg>
        </div>
        <p class="upload-text">Drop your room photo here</p>
        <p class="upload-hint">or click to browse · JPG, PNG, WEBP · Max 10MB</p>
        <input type="file" id="room-image-input" accept="image/*" />
      </div>

      <button class="btn-analyze" id="btn-analyze" disabled>
        <span class="analyzing-ring"></span>
        <svg class="btn-analyze-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
          <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
        </svg>
        Analyse My Room
      </button>

      <div class="upload-tips">
        <div class="tip-item"><div class="tip-dot"></div>Use a well-lit, wide-angle photo for best results</div>
        <div class="tip-item"><div class="tip-dot"></div>Include as much of the room as possible</div>
        <div class="tip-item"><div class="tip-dot"></div>Works with living rooms, bedrooms, offices & more</div>
        <div class="tip-item"><div class="tip-dot"></div>Your photo is analyzed privately and not stored</div>
      </div>
    </div>

    <!-- RIGHT: Results -->
    <div class="results-panel" id="results-panel">
      <div class="results-empty">
        <div class="results-empty-icon">🛋️</div>
        <p>Upload a room photo and click <strong style="color:rgba(245,223,160,0.6)">Analyse My Room</strong> to get personalized furniture recommendations from our AI design consultant.</p>
      </div>
    </div>

  </div>
</div>

<!-- SVG gradient def (hidden) -->
<svg width="0" height="0" style="position:absolute">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c47c35"/>
      <stop offset="100%" stop-color="#e8b84b"/>
    </linearGradient>
  </defs>
</svg>
`;

// Insert before footer (or at end of body)
const footer = document.querySelector('footer, .footer');
if (footer) footer.before(section);
else document.body.appendChild(section);

// ─── LOGIC ─────────────────────────────────────────────────────────────────
let uploadedImageBase64 = null;
let uploadedMimeType    = null;

const uploadZone  = document.getElementById('upload-zone');
const fileInput   = document.getElementById('room-image-input');
const analyzeBtn  = document.getElementById('btn-analyze');
const resultsPanel = document.getElementById('results-panel');

// Drag & drop
uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()=> uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
  if (file.size > 10 * 1024 * 1024)   { alert('Image must be under 10MB.');    return; }

  uploadedMimeType = file.type;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    uploadedImageBase64 = dataUrl.split(',')[1];

    // Show preview inside upload zone
    uploadZone.classList.add('has-image');
    uploadZone.innerHTML = `
      <img src="${dataUrl}" class="upload-preview" alt="Room preview" />
      <div class="upload-preview-overlay">
        <span class="preview-label">📸 Room photo ready</span>
        <button class="preview-change" onclick="document.getElementById('room-image-input').click();event.stopPropagation()">Change</button>
      </div>
      <input type="file" id="room-image-input" accept="image/*" style="display:none"/>
    `;
    // Re-bind file input inside zone
    document.getElementById('room-image-input').addEventListener('change', ev => {
      if (ev.target.files[0]) handleFile(ev.target.files[0]);
    });

    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

analyzeBtn.addEventListener('click', analyzeRoom);

async function analyzeRoom() {
  if (!uploadedImageBase64) return;

  analyzeBtn.classList.add('loading');
  analyzeBtn.disabled = true;
  analyzeBtn.querySelector('.analyzing-ring').style.display = 'block';

  showSkeleton();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: uploadedMimeType, data: uploadedImageBase64 }
            },
            { type: 'text', text: 'Please analyze this room and provide your recommendations as JSON.' }
          ]
        }]
      })
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const data = await response.json();
    const raw  = data.content.map(b => b.text || '').join('');

    // Strip any markdown fences
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    renderResults(result);

  } catch (err) {
    console.error('RoomVerse AI error:', err);
    resultsPanel.innerHTML = `
      <div class="results-error">
        <strong style="color:rgba(245,180,160,0.9)">⚠ Analysis failed</strong><br/>
        ${err.message.includes('API error 401')
          ? 'API key issue — make sure your Anthropic API key is configured.'
          : err.message.includes('API error 529')
          ? 'Our AI is very busy right now. Please try again in a moment.'
          : 'Something went wrong. Please try again or use a different image.'}
        <br/><small style="opacity:0.5;font-size:0.75rem">${err.message}</small>
      </div>`;
  } finally {
    analyzeBtn.classList.remove('loading');
    analyzeBtn.disabled = false;
  }
}

function showSkeleton() {
  resultsPanel.innerHTML = `
    <div class="skel-card">
      <div class="skeleton skel-line w-40"></div>
      <div class="skeleton skel-line w-80"></div>
      <div class="skeleton skel-line w-60"></div>
    </div>
    <div class="skel-card">
      <div class="skeleton skel-line w-60"></div>
      <div class="skeleton skel-line w-80"></div>
    </div>
    ${[1,2,3,4,5].map(()=>`
    <div class="skel-card" style="flex-direction:row;gap:0.75rem">
      <div class="skeleton" style="width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px"></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem">
        <div class="skeleton skel-line w-60"></div>
        <div class="skeleton skel-line w-80"></div>
        <div class="skeleton skel-line w-40"></div>
      </div>
    </div>`).join('')}
  `;
}

function renderResults(r) {
  const circumference = 2 * Math.PI * 35; // r=35 → c≈220
  const offset = circumference - (r.overallScore / 100) * circumference;

  const urgencyClass = u => u?.toLowerCase() || 'optional';

  resultsPanel.innerHTML = `
    <!-- Score -->
    <div class="score-card">
      <div class="score-ring-wrap">
        <svg viewBox="0 0 80 80">
          <circle class="score-ring-bg" cx="40" cy="40" r="35"/>
          <circle class="score-ring-fill" cx="40" cy="40" r="35" id="score-ring-fill"/>
        </svg>
        <div class="score-number">${r.overallScore}</div>
      </div>
      <div class="score-info">
        <div class="room-type-badge">${r.roomType || 'Room'}</div>
        <div class="score-label">${r.scoreLabel || 'Design Score'}</div>
        <div class="score-style">${r.currentStyle || ''}</div>
      </div>
    </div>

    <!-- Color Palette -->
    <div class="color-palette-card">
      <div class="card-label">Detected Colour Palette</div>
      <div class="color-swatches">
        ${(r.dominantColors || []).map(c => `<div class="color-swatch" style="background:${c}" title="${c}"></div>`).join('')}
      </div>
      <div class="color-mood">${r.colorMoodDescription || ''}</div>
    </div>

    <!-- Style Analysis -->
    <div class="analysis-card">
      <div class="card-label">Style Analysis</div>
      <div class="analysis-text">${r.styleAnalysis || ''}</div>
    </div>

    <!-- Recommendations -->
    <div class="recs-section">
      <div class="recs-heading">Recommended for your room</div>
      ${(r.recommendations || []).map(rec => `
        <div class="rec-card" onclick="scrollToProduct('${(rec.searchKeyword||'').toLowerCase()}')">
          <div class="rec-urgency ${urgencyClass(rec.urgency)}"></div>
          <div class="rec-body">
            <div class="rec-top">
              <div class="rec-item-name">${rec.item}</div>
              <div class="rec-category">${rec.category}</div>
            </div>
            <div class="rec-reason">${rec.reason}</div>
            <div class="rec-footer">
              <div class="rec-price">${rec.priceRange}</div>
              <div class="rec-shop-link">
                Shop now
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Pro Tip -->
    <div class="tip-card">
      <div class="tip-icon">💡</div>
      <div class="tip-content">
        <div class="tip-heading">Designer's Pro Tip</div>
        <div class="tip-text">${r.designTip || ''}</div>
      </div>
    </div>
  `;

  // Animate score ring
  requestAnimationFrame(() => {
    const ring = document.getElementById('score-ring-fill');
    if (ring) ring.style.strokeDashoffset = offset;
  });
}

// Scroll to a product in the catalog and highlight it
window.scrollToProduct = function(keyword) {
  const catalog = document.querySelector('.catalog-section, #catalog, .product-grid');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Try to find a matching product card
  setTimeout(() => {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
      if (name.includes(keyword)) {
        card.style.outline = '2px solid #e8b84b';
        card.style.outlineOffset = '3px';
        card.style.boxShadow = '0 0 30px rgba(232,184,75,0.25)';
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          card.style.outline = '';
          card.style.boxShadow = '';
        }, 3000);
      }
    });

    // Also activate the matching filter tab if present
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      if (tab.textContent.toLowerCase().includes(keyword)) tab.click();
    });
  }, 800);
};