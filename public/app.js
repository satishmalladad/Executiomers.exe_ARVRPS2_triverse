/* ═══════════════════════════════════════════════════════
   RoomVerse AI — app.js
   Full AR System: renderCatalog · openAR · launchAR
                   rotateModel · scaleModel · debug logs
═══════════════════════════════════════════════════════ */

"use strict";

// ══════════════════════════════════════════════════════
// ① PRODUCT CATALOG DATA
// ══════════════════════════════════════════════════════
const PRODUCTS = [
  {
    id: "sofa-01",
    name: "Oslo Sectional Sofa",
    category: "Seating",
    price: "$1,249",
    desc: "Low-profile sectional in oatmeal boucle. Perfect for open-plan living.",
    model: "models/sofa.glb",
    cameraOrbit: "0deg 80deg 2.5m",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    id: "chair-01",
    name: "Bauhaus Lounge Chair",
    category: "Seating",
    price: "$489",
    desc: "Mid-century shell form with walnut legs. Statement piece for any corner.",
    model: "models/chair.glb",
    cameraOrbit: "30deg 75deg 1.8m",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80",
  },
  {
    id: "table-01",
    name: "Nakashima Dining Table",
    category: "Tables",
    price: "$899",
    desc: "Live-edge walnut top on hairpin legs. Seats 6. Organic yet refined.",
    model: "models/dining_table.glb",
    cameraOrbit: "-20deg 65deg 2.2m",
    image: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=600&q=80",
  },
  {
    id: "shelf-01",
    name: "Umbra Floating Shelf",
    category: "Storage",
    price: "$199",
    desc: "Minimalist wall-mounted shelf unit, powder-coated steel + oak.",
    model: "models/floating_wall_shelf_unit.glb",
    cameraOrbit: "0deg 70deg 2m",
    image: "https://images.unsplash.com/photo-1597072689227-8882273e8f6a?w=600&q=80",
  },
  {
    id: "lamp-01",
    name: "Arc Floor Lamp",
    category: "Lighting",
    price: "$129",
    desc: "Minimalist arc lamp with brass finish. Perfect bedside or reading light.",
    model: "models/desk_lamp.glb",
    cameraOrbit: "0deg 75deg 1.5m",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
  },
  {
    id: "bed-01",
    name: "Oslo Platform Bed",
    category: "Bedroom",
    price: "$799",
    desc: "Low-profile king bed in walnut veneer. Clean Scandinavian lines.",
    model: "models/platform_bed.glb",
    cameraOrbit: "-20deg 70deg 3m",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
  },
  {
    id: "plant-01",
    name: "Fiddle Leaf Fig",
    category: "Decor",
    price: "$49",
    desc: "Large indoor plant in a terracotta pot. Brings life to any corner.",
    model: "models/plant.glb",
    cameraOrbit: "0deg 75deg 1.8m",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  },
  {
    id: "tvstand-01",
    name: "Media Console",
    category: "Living Room",
    price: "$349",
    desc: "Floating TV unit with oak drawers. Fits TVs up to 65 inches.",
    model: "models/tv_stand.glb",
    cameraOrbit: "0deg 65deg 2.5m",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    id: "wardrobe-01",
    name: "Hinoki Wardrobe",
    category: "Bedroom",
    price: "$649",
    desc: "3-door wardrobe in natural hinoki wood with soft-close hinges.",
    model: "models/wardrobe.glb",
    cameraOrbit: "15deg 75deg 3m",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: "desk-01",
    name: "Studio Writing Desk",
    category: "Office",
    price: "$299",
    desc: "Compact work desk with cable management. Ideal for home offices.",
    model: "models/desk.glb",
    cameraOrbit: "-10deg 70deg 2m",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80",
  },
];

// ══════════════════════════════════════════════════════
// ② STATE
// ══════════════════════════════════════════════════════
let currentProduct   = null;
let currentScale     = 1.0;
let currentRotationY = 0;
let autoRotateOn     = true;
let lastRetryProduct = null;

// ══════════════════════════════════════════════════════
// ③ RENDER CATALOG — with real images
// ══════════════════════════════════════════════════════
function renderCatalog() {
  console.log("[RoomVerse] 🛋️  renderCatalog() — building", PRODUCTS.length, "cards");
  const grid = document.getElementById("catalogGrid");
  if (!grid) { console.error("[RoomVerse] ❌ #catalogGrid not found"); return; }

  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card" id="card-${p.id}" data-product-id="${p.id}" onclick="openAR('${p.id}', false)">

      <div class="card-preview">
        <img
          src="${p.image}"
          alt="${p.name}"
          class="card-photo"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="card-photo-fallback" style="display:none;">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8L56 20V44L32 56L8 44V20L32 8Z"/><path d="M32 8V56M8 20L32 32L56 20"/>
          </svg>
        </div>
        <div class="card-photo-overlay"></div>
        <div class="card-photo-gloss"></div>
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
        <button class="btn-preview" onclick="event.stopPropagation(); openAR('${p.id}', false)">
          Preview 3D
        </button>
        <button class="btn-ar" onclick="event.stopPropagation(); openAR('${p.id}', true)">
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
// ④ OPEN AR
// ══════════════════════════════════════════════════════
function openAR(productId, tryAR = false) {
  console.log(`[RoomVerse] 🖱️  openAR() called — productId="${productId}", tryAR=${tryAR}`);

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    console.error(`[RoomVerse] ❌ Product "${productId}" not found in catalog`);
    showToast("Product not found.");
    return;
  }

  console.log(`[RoomVerse] 📦 Loading model: "${product.model}" for "${product.name}"`);

  document.querySelectorAll(".product-card").forEach(c => c.classList.remove("active-card"));
  const activeCard = document.getElementById(`card-${productId}`);
  if (activeCard) activeCard.classList.add("active-card");

  const viewerSection = document.getElementById("viewer-section");
  if (viewerSection) viewerSection.scrollIntoView({ behavior: "smooth", block: "start" });

  currentProduct   = product;
  lastRetryProduct = product;
  currentScale     = 1.0;
  currentRotationY = 0;

  showLoader(`Loading ${product.name}…`);
  hidePlaceholder();
  hideError();
  hideViewer();

  const statusEl = document.getElementById("viewerStatus");
  if (statusEl) statusEl.textContent = `Loading ${product.name}…`;

  const viewer = document.getElementById("furnitureViewer");
  if (!viewer) {
    console.error("[RoomVerse] ❌ #furnitureViewer element not found");
    showError("model-viewer element missing. Check HTML.");
    return;
  }

  viewer.style.display = "none";
  viewer.removeAttribute("src");
  viewer.setAttribute("auto-rotate", "");
  viewer.setAttribute("camera-controls", "");
  viewer.setAttribute("shadow-intensity", "1.2");
  viewer.setAttribute("exposure", "1.1");
  viewer.setAttribute("environment-image", "neutral");

  if (product.cameraOrbit) viewer.setAttribute("camera-orbit", product.cameraOrbit);

  const mvLabel = document.getElementById("mvProductName");
  if (mvLabel) mvLabel.textContent = product.name;

  const onLoad = () => {
    console.log(`[RoomVerse] ✅ Model loaded: "${product.model}"`);
    hideLoader();
    showViewer();
    showControls();

    const statusEl2 = document.getElementById("viewerStatus");
    if (statusEl2) statusEl2.textContent = `Viewing: ${product.name}`;

    updateScaleDisplay();
    syncAutoRotateBtn();

    if (tryAR) {
      console.log("[RoomVerse] 🚀 Auto-launching AR after model load");
      setTimeout(() => launchAR(), 400);
    }

    showToast(`${product.name} loaded`);
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
  viewer.setAttribute("src", product.model);

  console.log(`[RoomVerse] 📡 model-viewer src set to: "${product.model}"`);
}

// ══════════════════════════════════════════════════════
// ⑤ LAUNCH AR
// ══════════════════════════════════════════════════════
function launchAR() {
  console.log("[RoomVerse] 🕶️  launchAR() called");
  const viewer = document.getElementById("furnitureViewer");

  if (!currentProduct) {
    console.warn("[RoomVerse] ⚠️  launchAR() — no model selected");
    showToast("Please select a furniture item first.");
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (!viewer || viewer.style.display === "none") {
    console.warn("[RoomVerse] ⚠️  launchAR() — viewer not ready");
    showToast("Loading model for AR…");
    openAR(currentProduct.id, true);
    return;
  }

  const canAR = viewer.canActivateAR;
  console.log(`[RoomVerse] 📱 canActivateAR=${canAR}`);

  if (canAR) {
    try {
      viewer.activateAR();
      console.log("[RoomVerse] ✅ AR session activated");
    } catch (err) {
      console.error("[RoomVerse] ❌ AR activation failed:", err);
      showToast("AR activation failed. Try the 'View in your room' button.");
    }
  } else {
    console.log("[RoomVerse] 🖥️  Desktop — AR not available, 3D preview active");
    showToast("3D preview active. Open on mobile Chrome/Safari for AR.");
    const wrapper = document.getElementById("viewerWrapper");
    if (wrapper) {
      wrapper.style.outline = "3px solid var(--amber)";
      setTimeout(() => { wrapper.style.outline = ""; }, 2000);
    }
  }
}

// ══════════════════════════════════════════════════════
// ⑥ ROTATE MODEL
// ══════════════════════════════════════════════════════
function rotateModel(degrees) {
  const viewer = document.getElementById("furnitureViewer");
  if (!viewer || viewer.style.display === "none") {
    showToast("Load a model first.");
    return;
  }

  if (degrees === 0) {
    currentRotationY = 0;
  } else {
    currentRotationY = (currentRotationY + degrees + 360) % 360;
  }

  try {
    const orbit  = viewer.getCameraOrbit?.();
    const radius = orbit ? orbit.radius : 2;
    const phi    = orbit ? (orbit.phi * 180 / Math.PI) : 75;
    viewer.cameraOrbit = `${currentRotationY}deg ${phi}deg ${radius}m`;
  } catch (e) {
    viewer.setAttribute("camera-orbit", `${currentRotationY}deg 75deg auto`);
  }
}

// ══════════════════════════════════════════════════════
// ⑦ SCALE MODEL
// ══════════════════════════════════════════════════════
function scaleModel(delta) {
  const viewer = document.getElementById("furnitureViewer");
  if (!viewer || viewer.style.display === "none") {
    showToast("Load a model first.");
    return;
  }

  currentScale = Math.max(0.2, Math.min(4.0, currentScale + delta));
  viewer.style.transform      = `scale(${currentScale})`;
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
  } else {
    viewer.removeAttribute("auto-rotate");
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
  if (!lastRetryProduct) { showToast("Nothing to retry."); return; }
  openAR(lastRetryProduct.id, false);
}

// ══════════════════════════════════════════════════════
// ⑩ UI HELPERS
// ══════════════════════════════════════════════════════
function showLoader(text = "Loading…") {
  const loader = document.getElementById("viewerLoader");
  const txt    = document.getElementById("loaderText");
  if (loader) loader.style.display = "flex";
  if (txt)    txt.textContent = text;
}
function hideLoader() {
  const loader = document.getElementById("viewerLoader");
  if (loader) loader.style.display = "none";
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
  let toast = document.getElementById("rvToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "rvToast";
    toast.style.cssText = `
      position:fixed; bottom:32px; left:50%; transform:translateX(-50%) translateY(20px);
      background:#1a1108; border:1px solid rgba(200,137,42,0.4);
      color:#f5dfa0; padding:12px 28px; border-radius:12px;
      font-size:14px; font-weight:500; z-index:9999;
      opacity:0; transition:all 0.3s; pointer-events:none;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  if (toastTimer) clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, duration);
}

// ══════════════════════════════════════════════════════
// ⑫ NAV HIGHLIGHT
// ══════════════════════════════════════════════════════
function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll(".nav-link");

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
  renderCatalog();
  initNavHighlight();

  const viewer = document.getElementById("furnitureViewer");
  if (viewer) {
    customElements.whenDefined("model-viewer").then(() => {
      console.log("[RoomVerse] 📦 model-viewer defined");
    });
  }

  console.log("[RoomVerse] ✅ Init complete");
});