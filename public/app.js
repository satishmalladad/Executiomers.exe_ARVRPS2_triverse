/* ═══════════════════════════════════════════════════════
   RoomVerse AI — app.js
   Full AR System: renderCatalog · openAR · launchAR
                   rotateModel · scaleModel · debug logs
═══════════════════════════════════════════════════════ */

"use strict";

// ══════════════════════════════════════════════════════
// ① PRODUCT CATALOG DATA
//    ONLY real furniture models — no astronauts, no robots
// ══════════════════════════════════════════════════════
const PRODUCTS = [
  {
    id: "sofa-01",
    name: "Oslo Sectional Sofa",
    category: "Seating",
    price: "$1,249",
    desc: "Low-profile sectional in oatmeal boucle. Perfect for open-plan living.",
    model: "models/sofa.glb",        // ← REAL furniture model
    cameraOrbit: "0deg 80deg 2.5m",
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
             <rect x="6" y="28" width="52" height="18" rx="4"/>
             <rect x="6" y="22" width="12" height="24" rx="3"/>
             <rect x="46" y="22" width="12" height="24" rx="3"/>
             <rect x="14" y="46" width="8" height="8" rx="2"/>
             <rect x="42" y="46" width="8" height="8" rx="2"/>
           </svg>`,
  },
  {
    id: "chair-01",
    name: "Bauhaus Lounge Chair",
    category: "Seating",
    price: "$489",
    desc: "Mid-century shell form with walnut legs. Statement piece for any corner.",
    model: "models/chair.glb",       // ← REAL furniture model
    cameraOrbit: "30deg 75deg 1.8m",
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
             <rect x="14" y="24" width="36" height="18" rx="5"/>
             <rect x="14" y="22" width="8" height="20" rx="3"/>
             <line x1="18" y1="42" x2="14" y2="56"/>
             <line x1="46" y1="42" x2="50" y2="56"/>
             <line x1="22" y1="42" x2="20" y2="56"/>
             <line x1="42" y1="42" x2="44" y2="56"/>
           </svg>`,
  },
  {
    id: "table-01",
    name: "Nakashima Dining Table",
    category: "Tables",
    price: "$899",
    desc: "Live-edge walnut top on hairpin legs. Seats 6. Organic yet refined.",
    model: "models/dining_table.glb",       // ← REAL furniture model
    cameraOrbit: "-20deg 65deg 2.2m",
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
             <rect x="6" y="22" width="52" height="10" rx="3"/>
             <line x1="14" y1="32" x2="12" y2="54"/>
             <line x1="50" y1="32" x2="52" y2="54"/>
             <line x1="22" y1="32" x2="21" y2="54"/>
             <line x1="42" y1="32" x2="43" y2="54"/>
           </svg>`,
  },
  {
    id: "shelf-01",
    name: "Umbra Floating Shelf",
    category: "Storage",
    price: "$199",
    desc: "Minimalist wall-mounted shelf unit, powder-coated steel + oak.",
    model: "models/floating_wall_shelf_unit.glb",       // reuses table model as fallback
    cameraOrbit: "0deg 70deg 2m",
    icon: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
             <rect x="4" y="12" width="56" height="8" rx="2"/>
             <rect x="4" y="28" width="56" height="8" rx="2"/>
             <rect x="4" y="44" width="56" height="8" rx="2"/>
             <line x1="10" y1="20" x2="10" y2="28"/>
             <line x1="54" y1="20" x2="54" y2="28"/>
             <line x1="10" y1="36" x2="10" y2="44"/>
             <line x1="54" y1="36" x2="54" y2="44"/>
           </svg>`,
  },
];

// ══════════════════════════════════════════════════════
// ② STATE
// ══════════════════════════════════════════════════════
let currentProduct   = null;   // currently loaded product object
let currentScale     = 1.0;    // current model scale multiplier
let currentRotationY = 0;      // cumulative Y rotation in degrees
let autoRotateOn     = true;   // auto-rotate toggle state
let lastRetryProduct = null;   // for retry on error

// ══════════════════════════════════════════════════════
// ③ RENDER CATALOG
// ══════════════════════════════════════════════════════
function renderCatalog() {
  console.log("[RoomVerse] 🛋️  renderCatalog() — building", PRODUCTS.length, "cards");
  const grid = document.getElementById("catalogGrid");
  if (!grid) { console.error("[RoomVerse] ❌ #catalogGrid not found"); return; }

  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card" id="card-${p.id}" data-product-id="${p.id}">
      <div class="card-preview">
        <div class="card-preview-icon">${p.icon}</div>
        <span class="card-tag">${p.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-meta">
          <span class="card-price">${p.price} <span>USD</span></span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-preview" onclick="openAR('${p.id}', false)">
          Preview 3D
        </button>
        <button class="btn-ar" onclick="openAR('${p.id}', true)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/>
          </svg>
          AR View
        </button>
      </div>
    </article>
  `).join("");

  console.log("[RoomVerse] ✅ Catalog rendered with", PRODUCTS.length, "furniture items");
}

// ══════════════════════════════════════════════════════
// ④ OPEN AR — main entry point for both 3D preview & AR
// ══════════════════════════════════════════════════════
/**
 * @param {string}  productId   — id from PRODUCTS array
 * @param {boolean} tryAR       — if true, activate AR immediately after load
 */
function openAR(productId, tryAR = false) {
  console.log(`[RoomVerse] 🖱️  openAR() called — productId="${productId}", tryAR=${tryAR}`);

  // ── (a) Find product ────────────────────────────────
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    console.error(`[RoomVerse] ❌ Product "${productId}" not found in catalog`);
    showToast("Product not found.");
    return;
  }

  console.log(`[RoomVerse] 📦 Loading model: "${product.model}" for "${product.name}"`);

  // ── (b) Update active card state ────────────────────
  document.querySelectorAll(".product-card").forEach(c => c.classList.remove("active-card"));
  const activeCard = document.getElementById(`card-${productId}`);
  if (activeCard) activeCard.classList.add("active-card");

  // ── (c) Scroll viewer into view ─────────────────────
  const viewerSection = document.getElementById("viewer-section");
  if (viewerSection) {
    viewerSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── (d) Store current product & save retry ref ──────
  currentProduct     = product;
  lastRetryProduct   = product;
  currentScale       = 1.0;
  currentRotationY   = 0;

  // ── (e) Show loader, hide placeholder & error ───────
  showLoader(`Loading ${product.name}…`);
  hidePlaceholder();
  hideError();
  hideViewer();

  // ── (f) Update status text ──────────────────────────
  const statusEl = document.getElementById("viewerStatus");
  if (statusEl) statusEl.textContent = `Loading ${product.name}…`;

  // ── (g) Get the model-viewer element ────────────────
  const viewer = document.getElementById("furnitureViewer");
  if (!viewer) {
    console.error("[RoomVerse] ❌ #furnitureViewer element not found");
    showError("model-viewer element missing. Check HTML.");
    return;
  }

  // ── (h) Reset viewer state ──────────────────────────
  viewer.style.display = "none";
  viewer.removeAttribute("src");
  viewer.setAttribute("auto-rotate", "");
  viewer.setAttribute("camera-controls", "");
  viewer.setAttribute("shadow-intensity", "1.2");
  viewer.setAttribute("exposure", "1.1");
  viewer.setAttribute("environment-image", "neutral");

  // ── (i) Set camera orbit if specified ───────────────
  if (product.cameraOrbit) {
    viewer.setAttribute("camera-orbit", product.cameraOrbit);
  }

  // ── (j) Update hotspot label ─────────────────────────
  const mvLabel = document.getElementById("mvProductName");
  if (mvLabel) mvLabel.textContent = product.name;

  // ── (k) Attach load/error event listeners ───────────
  const onLoad = () => {
    console.log(`[RoomVerse] ✅ Model loaded successfully: "${product.model}"`);
    hideLoader();
    showViewer();
    showControls();

    const statusEl2 = document.getElementById("viewerStatus");
    if (statusEl2) statusEl2.textContent = `Viewing: ${product.name}`;

    // Reset scale display
    updateScaleDisplay();

    // Auto-rotate badge sync
    syncAutoRotateBtn();

    // Activate AR immediately if requested
    if (tryAR) {
      console.log("[RoomVerse] 🚀 Auto-launching AR after model load");
      setTimeout(() => launchAR(), 400);
    }

    showToast(`${product.name} loaded`);

    // Clean up listeners
    viewer.removeEventListener("load", onLoad);
    viewer.removeEventListener("error", onError);
  };

  const onError = (e) => {
    console.error(`[RoomVerse] ❌ Model load error for "${product.model}"`, e);
    hideLoader();
    showError(`Could not load "${product.model}". Check that the file exists in /models/.`);

    const statusEl3 = document.getElementById("viewerStatus");
    if (statusEl3) statusEl3.textContent = "Error loading model.";

    viewer.removeEventListener("load", onLoad);
    viewer.removeEventListener("error", onError);
  };

  viewer.addEventListener("load", onLoad);
  viewer.addEventListener("error", onError);

  // ── (l) Set src — triggers model fetch ──────────────
  viewer.setAttribute("src", product.model);
  console.log(`[RoomVerse] 📡 model-viewer src set to: "${product.model}"`);
}

// ══════════════════════════════════════════════════════
// ⑤ LAUNCH AR — activate AR session
// ══════════════════════════════════════════════════════
function launchAR() {
  console.log("[RoomVerse] 🕶️  launchAR() called");

  const viewer = document.getElementById("furnitureViewer");

  // ── Guard: no model selected ─────────────────────────
  if (!currentProduct) {
    console.warn("[RoomVerse] ⚠️  launchAR() — no model selected yet");
    showToast("Please select a furniture item first.");
    // Scroll to catalog
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // ── Guard: viewer not visible / model not loaded ─────
  if (!viewer || viewer.style.display === "none") {
    console.warn("[RoomVerse] ⚠️  launchAR() — viewer not ready, loading model first");
    showToast("Loading model for AR…");
    openAR(currentProduct.id, true);
    return;
  }

  // ── Check AR availability ────────────────────────────
  const canAR = viewer.canActivateAR;
  console.log(`[RoomVerse] 📱 AR availability: canActivateAR=${canAR}`);

  if (canAR) {
    // Mobile / AR capable device — activate AR
    console.log("[RoomVerse] 🚀 Activating AR session via model-viewer.activateAR()");
    try {
      viewer.activateAR();
      console.log("[RoomVerse] ✅ AR session activated");
    } catch (err) {
      console.error("[RoomVerse] ❌ AR activation failed:", err);
      showToast("AR activation failed. Try the 'View in your room' button in the 3D viewer.");
    }
  } else {
    // Desktop — AR not directly activatable; 3D viewer is the experience
    console.log("[RoomVerse] 🖥️  Desktop detected — AR not available, 3D preview active");
    showToast("3D preview active. Open on mobile Chrome/Safari for AR.");
    // Highlight the viewer
    const wrapper = document.getElementById("viewerWrapper");
    if (wrapper) {
      wrapper.style.outline = "3px solid var(--caramel)";
      setTimeout(() => { wrapper.style.outline = ""; }, 2000);
    }
  }
}

// ══════════════════════════════════════════════════════
// ⑥ ROTATE MODEL
// ══════════════════════════════════════════════════════
/**
 * @param {number} degrees — delta to add to Y rotation.
 *                           Pass 0 to reset to 0°.
 */
function rotateModel(degrees) {
  const viewer = document.getElementById("furnitureViewer");
  if (!viewer || viewer.style.display === "none") {
    console.warn("[RoomVerse] ⚠️  rotateModel() — no model loaded");
    showToast("Load a model first.");
    return;
  }

  if (degrees === 0) {
    // Reset rotation
    currentRotationY = 0;
    console.log("[RoomVerse] 🔄 rotateModel() — reset to 0°");
  } else {
    currentRotationY = (currentRotationY + degrees + 360) % 360;
    console.log(`[RoomVerse] 🔄 rotateModel() — new Y rotation: ${currentRotationY}°`);
  }

  // Apply via camera-orbit (theta) keeping current radius/phi
  try {
    const orbit = viewer.getCameraOrbit?.();
    const radius = orbit ? orbit.radius : 2;
    const phi    = orbit ? (orbit.phi * 180 / Math.PI) : 75;
    viewer.cameraOrbit = `${currentRotationY}deg ${phi}deg ${radius}m`;
  } catch (e) {
    // Fallback: set attribute directly
    viewer.setAttribute("camera-orbit", `${currentRotationY}deg 75deg auto`);
  }
}

// ══════════════════════════════════════════════════════
// ⑦ SCALE MODEL
// ══════════════════════════════════════════════════════
/**
 * @param {number} delta — amount to add/subtract from scale.
 *                         e.g. 0.2 = +20%, -0.2 = -20%
 */
function scaleModel(delta) {
  const viewer = document.getElementById("furnitureViewer");
  if (!viewer || viewer.style.display === "none") {
    console.warn("[RoomVerse] ⚠️  scaleModel() — no model loaded");
    showToast("Load a model first.");
    return;
  }

  const MIN_SCALE = 0.2;
  const MAX_SCALE = 4.0;

  currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentScale + delta));
  console.log(`[RoomVerse] 📐 scaleModel() — new scale: ${currentScale.toFixed(1)}×`);

  // model-viewer supports CSS transform on the host element for visual scaling
  // but the proper API is via --scale custom property or style transform
  viewer.style.transform = `scale(${currentScale})`;
  viewer.style.transformOrigin = "center bottom";

  updateScaleDisplay();
}

// ══════════════════════════════════════════════════════
// ⑧ AUTO-ROTATE TOGGLE
// ══════════════════════════════════════════════════════
function toggleAutoRotate() {
  const viewer = document.getElementById("furnitureViewer");
  if (!viewer) return;

  autoRotateOn = !autoRotateOn;

  if (autoRotateOn) {
    viewer.setAttribute("auto-rotate", "");
    console.log("[RoomVerse] 🔁 Auto-rotate ON");
  } else {
    viewer.removeAttribute("auto-rotate");
    console.log("[RoomVerse] ⏹️  Auto-rotate OFF");
  }

  syncAutoRotateBtn();
}

function syncAutoRotateBtn() {
  const btn = document.getElementById("autoRotateBtn");
  if (!btn) return;
  btn.classList.toggle("active", autoRotateOn);
  btn.innerHTML = autoRotateOn
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.95"/></svg> On`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M20.49 15a9 9 0 0 1-16.49-4h4"/></svg> Off`;
}

// ══════════════════════════════════════════════════════
// ⑨ RETRY LOAD
// ══════════════════════════════════════════════════════
function retryLoad() {
  if (!lastRetryProduct) {
    showToast("Nothing to retry.");
    return;
  }
  console.log(`[RoomVerse] 🔁 retryLoad() — retrying "${lastRetryProduct.id}"`);
  openAR(lastRetryProduct.id, false);
}

// ══════════════════════════════════════════════════════
// ⑩ UI HELPERS
// ══════════════════════════════════════════════════════
function showLoader(text = "Loading…") {
  const loader = document.getElementById("viewerLoader");
  const txt    = document.getElementById("loaderText");
  if (loader) loader.classList.add("visible");
  if (txt)    txt.textContent = text;
}

function hideLoader() {
  const loader = document.getElementById("viewerLoader");
  if (loader) loader.classList.remove("visible");
}

function showViewer() {
  const viewer = document.getElementById("furnitureViewer");
  if (viewer) viewer.style.display = "block";
}

function hideViewer() {
  const viewer = document.getElementById("furnitureViewer");
  if (viewer) viewer.style.display = "none";
}

function hidePlaceholder() {
  const ph = document.getElementById("viewerPlaceholder");
  if (ph) ph.style.display = "none";
}

function showPlaceholder() {
  const ph = document.getElementById("viewerPlaceholder");
  if (ph) ph.style.display = "flex";
}

function hideError() {
  const err = document.getElementById("viewerError");
  if (err) err.style.display = "none";
}

function showError(msg = "Failed to load model.") {
  const err    = document.getElementById("viewerError");
  const errMsg = document.getElementById("viewerErrorMsg");
  if (err)    err.style.display = "flex";
  if (errMsg) errMsg.textContent = msg;
  hidePlaceholder();
  hideLoader();
}

function showControls() {
  const panel = document.getElementById("controlsPanel");
  if (panel) panel.style.display = "block";
}

function updateScaleDisplay() {
  const display = document.getElementById("scaleDisplay");
  if (display) display.textContent = `${currentScale.toFixed(1)}×`;
}

// ══════════════════════════════════════════════════════
// ⑪ TOAST NOTIFICATION
// ══════════════════════════════════════════════════════
let toastTimer = null;

function showToast(message, duration = 3000) {
  // Create or reuse toast
  let toast = document.getElementById("rvToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "rvToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;

  // Clear previous timer
  if (toastTimer) clearTimeout(toastTimer);

  // Show
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  // Hide after duration
  toastTimer = setTimeout(() => {
    toast.classList.remove("toast-show");
  }, duration);
}

// ══════════════════════════════════════════════════════
// ⑫ HEADER NAV ACTIVE STATE
// ══════════════════════════════════════════════════════
function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

// ══════════════════════════════════════════════════════
// ⑬ INIT
// ══════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  console.log("[RoomVerse] 🏠 RoomVerse AI — initialising");
  console.log("[RoomVerse] 📋 Product count:", PRODUCTS.length);

  renderCatalog();
  initNavHighlight();

  // Log AR support info
  const viewer = document.getElementById("furnitureViewer");
  if (viewer) {
    customElements.whenDefined("model-viewer").then(() => {
      console.log("[RoomVerse] 📦 model-viewer web component defined");
      console.log("[RoomVerse] 📱 User agent:", navigator.userAgent);
      console.log("[RoomVerse] 🌐 XR supported:", !!navigator.xr);
    });
  } else {
    console.error("[RoomVerse] ❌ CRITICAL: <model-viewer> element missing from DOM");
  }

  console.log("[RoomVerse] ✅ Initialisation complete");
});
