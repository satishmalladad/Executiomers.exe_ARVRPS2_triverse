# 🏠 RoomVerse AI — AR Interior Design

> WebXR-powered furniture AR app. Preview real furniture in 3D on desktop, place it in your room on mobile.

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your furniture models
Place your `.glb` files inside `public/models/`:
```
public/
  models/
    sofa.glb      ← Sofa model
    chair.glb     ← Chair model
    table.glb     ← Table / dining set model
  index.html
  styles.css
  app.js
```

> **Free .glb furniture models:**
> - https://sketchfab.com (search "sofa", "chair", "table" → filter CC license → Download GLB)
> - https://poly.pizza (free low-poly furniture)
> - https://market.pmnd.rs (free GLTF/GLB assets)

### 3. Run the server
```bash
npm start
```
Then open **http://localhost:3000**

---

## 📁 File Structure

```
roomverse/
├── public/
│   ├── index.html       ← App shell + model-viewer markup
│   ├── styles.css       ← Design system (warm editorial)
│   ├── app.js           ← All AR logic
│   └── models/
│       ├── sofa.glb
│       ├── chair.glb
│       └── table.glb
├── server.js            ← Express backend
├── package.json
└── README.md
```

---

## 🎯 Features

| Feature | Desktop | Mobile Android | Mobile iOS |
|---------|---------|----------------|------------|
| 3D Preview | ✅ | ✅ | ✅ |
| AR Placement | ❌ (3D only) | ✅ Scene Viewer | ✅ Quick Look |
| Camera Controls | ✅ | ✅ | ✅ |
| Auto Rotate | ✅ | ✅ | ✅ |
| Scale Controls | ✅ | ✅ | ✅ |
| Floor Placement | — | ✅ WebXR | ✅ Quick Look |

---

## 🔧 AR System Functions

### `renderCatalog()`
Builds the product grid from `PRODUCTS` array with Preview 3D + AR View buttons.

### `openAR(productId, tryAR?)`
Core function:
1. Finds product by ID
2. Shows loader
3. Hides placeholder
4. Sets `model-viewer src` to real `.glb` furniture model
5. On load → shows viewer + controls
6. If `tryAR=true` → auto-launches AR after load

### `launchAR()`
- Checks `viewer.canActivateAR`
- **Mobile**: calls `viewer.activateAR()` → opens camera + floor placement
- **Desktop**: shows toast + highlights 3D viewer

### `rotateModel(degrees)`
- Pass `45` / `-45` to rotate left/right
- Pass `0` to reset rotation

### `scaleModel(delta)`
- Pass `0.2` to scale up, `-0.2` to scale down
- Clamped between `0.2×` and `4.0×`

---

## 🌐 AR Modes (model-viewer)

```html
ar-modes="webxr scene-viewer quick-look"
```

- **webxr** — Chrome on Android with WebXR support
- **scene-viewer** — Android fallback (Google Scene Viewer app)
- **quick-look** — iOS Safari AR Quick Look

---

## 🚨 Rules Enforced

- ✅ Only furniture models (`sofa.glb`, `chair.glb`, `table.glb`)
- ❌ No astronaut models
- ❌ No robot models
- ❌ No placeholder/demo models

---

## 📱 Testing AR

**Android:**
1. Open http://your-ip:3000 in Chrome
2. Click any product → "AR View"
3. Point camera at floor → tap to place

**iOS:**
1. Open in Safari
2. Click "View in your room" inside the 3D viewer
3. AR Quick Look opens with the furniture

---

*Built for hackathon — RoomVerse AI × WebXR*
