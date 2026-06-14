"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getScrollP, getPointer } from "@/lib/scrollStore";

/**
 * The procedural "garden walk" background — ported verbatim from the export's
 * Three.js (r128) IIFE into a client component. Reads scroll progress and
 * pointer from the shared scroll store each frame; disposes all WebGL resources
 * on unmount. Honors prefers-reduced-motion (no sway/parallax).
 */
export default function GardenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }

    let W = window.innerWidth,
      H = window.innerHeight,
      MOBILE = W < 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);

    const scene = new THREE.Scene();
    // light-blue sky gradient (blue overhead -> pale toward the horizon)
    const skyC = document.createElement("canvas");
    skyC.width = 4;
    skyC.height = 256;
    const sxc = skyC.getContext("2d")!;
    const sg = sxc.createLinearGradient(0, 0, 0, 256);
    sg.addColorStop(0, "#a9d4f2");
    sg.addColorStop(0.45, "#c8e6f4");
    sg.addColorStop(0.74, "#e2f0ec");
    sg.addColorStop(1, "#e9f3e4");
    sxc.fillStyle = sg;
    sxc.fillRect(0, 0, 4, 256);
    const skyTex = new THREE.Texture(skyC);
    skyTex.needsUpdate = true;
    scene.background = skyTex;
    const colCool = new THREE.Color(0xdcecec),
      colWarm = new THREE.Color(0xeae3cf);
    scene.fog = new THREE.FogExp2(0xe2efe9, MOBILE ? 0.017 : 0.013);

    const GROUND_Y = -2.0,
      Z_NEAR = 14,
      Z_FAR = -265,
      CAM_START = 10,
      CAM_END = -250;
    const camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 700);
    camera.position.set(0, 0, CAM_START);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const sunL = new THREE.DirectionalLight(0xfff0cf, 0.7);
    sunL.position.set(-6, 10, 4);
    scene.add(sunL);

    const rand = (() => {
      let s = 20260614;
      return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
      };
    })();
    const rr = (a: number, b: number) => a + (b - a) * rand();
    const pick = <T,>(a: T[]): T => a[(rand() * a.length) | 0];
    const tex = (c: HTMLCanvasElement) => {
      const t = new THREE.Texture(c);
      t.needsUpdate = true;
      return t;
    };

    /* --- realistic flower & foliage textures --- */
    const hx2rgb = (h: string) => {
      h = h.replace("#", "");
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    };
    const mix = (h: string, t: string, a: number) => {
      const p = hx2rgb(h),
        q = hx2rgb(t);
      return "rgb(" + ((p[0] + (q[0] - p[0]) * a) | 0) + "," + ((p[1] + (q[1] - p[1]) * a) | 0) + "," + ((p[2] + (q[2] - p[2]) * a) | 0) + ")";
    };
    const lighten = (h: string, a: number) => mix(h, "#ffffff", a);
    const darken = (h: string, a: number) => mix(h, "#000000", a);

    function stemLeaf(x: CanvasRenderingContext2D, px: number, py: number, ang: number, len: number, wid: number) {
      x.save();
      x.translate(px, py);
      x.rotate(ang);
      const g = x.createLinearGradient(0, -wid, 0, wid);
      g.addColorStop(0, "#5aa377");
      g.addColorStop(0.5, "#3c8256");
      g.addColorStop(1, "#28623f");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(0, 0);
      x.quadraticCurveTo(len * 0.5, -wid, len, 0);
      x.quadraticCurveTo(len * 0.5, wid, 0, 0);
      x.fill();
      x.strokeStyle = "rgba(18,46,30,.45)";
      x.lineWidth = 1.1;
      x.beginPath();
      x.moveTo(2, 0);
      x.lineTo(len * 0.9, 0);
      x.stroke();
      x.restore();
    }
    function stem(x: CanvasRenderingContext2D, cx: number) {
      const g = x.createLinearGradient(cx - 5, 0, cx + 5, 0);
      g.addColorStop(0, "#235b3a");
      g.addColorStop(0.45, "#3f865a");
      g.addColorStop(0.55, "#4f9a6c");
      g.addColorStop(1, "#235b3a");
      x.strokeStyle = g;
      x.lineWidth = 8;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(cx, 340);
      x.quadraticCurveTo(cx - 7, 212, cx, 116);
      x.stroke();
      stemLeaf(x, cx, 252, -0.62, 40, 11);
      stemLeaf(x, cx, 286, 0.62, 40, 11);
    }
    function makeFlower(species: string, col: string) {
      const c = document.createElement("canvas");
      c.width = 260;
      c.height = 468;
      const x = c.getContext("2d")!;
      x.scale(1.3, 1.3);
      const cx = 100,
        cy = 86;
      stem(x, cx);
      x.save();
      x.translate(cx, cy);
      x.lineJoin = "round";
      function petalP(len: number, wid: number) {
        x.beginPath();
        x.moveTo(0, 0);
        x.bezierCurveTo(wid, -len * 0.3, wid * 0.66, -len * 0.96, 0, -len);
        x.bezierCurveTo(-wid * 0.66, -len * 0.96, -wid, -len * 0.3, 0, 0);
      }
      function ring(n: number, len: number, wid: number, base: string, jit: boolean, off: number, vein: boolean) {
        for (let i = 0; i < n; i++) {
          x.save();
          x.rotate((i / n) * 6.283 + (off || 0) + (jit ? (rand() - 0.5) * 0.16 : 0));
          const lv = (rand() - 0.5) * 0.16,
            L = len * (0.9 + rand() * 0.18);
          const g = x.createLinearGradient(0, 0, 0, -L);
          g.addColorStop(0, darken(base, 0.34));
          g.addColorStop(0.45, lv > 0 ? lighten(base, lv) : darken(base, -lv));
          g.addColorStop(1, lighten(base, 0.26 + Math.max(0, lv)));
          x.fillStyle = g;
          petalP(L, wid);
          x.fill();
          if (vein) {
            x.strokeStyle = "rgba(255,255,255,.14)";
            x.lineWidth = 1;
            x.beginPath();
            x.moveTo(0, -2);
            x.lineTo(0, -L * 0.85);
            x.stroke();
          }
          x.restore();
        }
      }
      function disc(r: number, inner: string, outer: string, speck: string | null) {
        x.fillStyle = "rgba(20,40,20,.16)";
        x.beginPath();
        x.arc(0, 0, r * 1.22, 0, 6.28);
        x.fill();
        const g = x.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
        g.addColorStop(0, lighten(inner, 0.25));
        g.addColorStop(0.55, inner);
        g.addColorStop(1, outer);
        x.fillStyle = g;
        x.beginPath();
        x.arc(0, 0, r, 0, 6.28);
        x.fill();
        if (speck) {
          for (let d = 0; d < ((r * 1.5) | 0); d++) {
            const a = rand() * 6.28,
              rr2 = Math.sqrt(rand()) * r * 0.82;
            x.fillStyle = "rgba(" + speck + "," + (0.2 + rand() * 0.25).toFixed(2) + ")";
            x.beginPath();
            x.arc(Math.cos(a) * rr2, Math.sin(a) * rr2, r * 0.06 + 0.4, 0, 6.28);
            x.fill();
          }
        }
      }
      if (species === "daisy") {
        ring(16, 46, 8, "#fbfdfb", true, 0, true);
        ring(16, 40, 7, "#ffffff", true, 0.2, true);
        disc(14, "#ffd24a", "#d8881c", "150,96,24");
      } else if (species === "dahlia") {
        ring(16, 48, 11, col, true, 0, true);
        ring(13, 38, 10, col, true, 0.22, true);
        ring(11, 28, 9, lighten(col, 0.12), true, 0.14, true);
        ring(8, 18, 8, lighten(col, 0.22), true, 0.34, false);
        disc(7, "#ffd24a", "#e0992a", "150,96,24");
      } else if (species === "cosmos") {
        ring(8, 50, 18, col, true, 0, true);
        disc(11, "#ffce42", "#d98e20", "150,100,24");
      } else if (species === "poppy") {
        ring(5, 50, 27, col, true, 0, true);
        ring(5, 46, 24, darken(col, 0.12), true, 0.3, false);
        disc(11, "#231307", "#000000", "30,16,8");
        for (let pst = 0; pst < 16; pst++) {
          x.save();
          x.rotate((pst / 16) * 6.28);
          x.strokeStyle = "#1c1008";
          x.lineWidth = 1.2;
          x.beginPath();
          x.moveTo(0, -9);
          x.lineTo(0, -15);
          x.stroke();
          x.restore();
        }
      } else if (species === "tulip") {
        const bk = (dx: number, sc: number, c1: string) => {
          x.save();
          x.translate(dx, 2);
          x.scale(sc, 1);
          const g = x.createLinearGradient(0, 12, 0, -60);
          g.addColorStop(0, darken(c1, 0.2));
          g.addColorStop(1, lighten(c1, 0.12));
          x.fillStyle = g;
          x.beginPath();
          x.moveTo(-20, 8);
          x.quadraticCurveTo(-26, -46, -7, -58);
          x.quadraticCurveTo(0, -44, 7, -58);
          x.quadraticCurveTo(26, -46, 20, 8);
          x.quadraticCurveTo(0, 20, -20, 8);
          x.fill();
          x.restore();
        };
        bk(-9, 0.8, darken(col, 0.14));
        bk(9, 0.8, darken(col, 0.14));
        bk(0, 1, col);
        x.strokeStyle = "rgba(0,0,0,.12)";
        x.lineWidth = 1.2;
        x.beginPath();
        x.moveTo(0, 4);
        x.lineTo(0, -52);
        x.stroke();
      } else if (species === "rose") {
        for (let L = 4; L >= 1; L--) {
          ring(Math.max(4, L * 3), 12 + L * 8, 10, L >= 3 ? col : lighten(col, 0.06), true, rand(), false);
        }
        disc(6, darken(col, 0.05), darken(col, 0.22), null);
      } else if (species === "lavender") {
        for (let s2 = 0; s2 < 8; s2++) {
          const yy = -16 - s2 * 8.5,
            ww = (9 - s2 * 0.8) * 0.6;
          const fg = x.createRadialGradient(0, yy, 0, 0, yy, ww + 3);
          fg.addColorStop(0, lighten(col, 0.2));
          fg.addColorStop(1, darken(col, 0.1));
          x.fillStyle = fg;
          x.beginPath();
          x.ellipse(-6, yy, ww, 5, 0, 0, 6.28);
          x.fill();
          x.beginPath();
          x.ellipse(6, yy, ww, 5, 0, 0, 6.28);
          x.fill();
          x.beginPath();
          x.ellipse(0, yy - 4, ww, 5, 0, 0, 6.28);
          x.fill();
        }
      } else if (species === "marigold") {
        ring(18, 40, 9, col, true, 0, true);
        ring(15, 32, 9, darken(col, 0.06), true, 0.18, true);
        ring(12, 24, 8, darken(col, 0.14), true, 0.12, true);
        ring(9, 15, 7, darken(col, 0.22), true, 0.3, false);
        disc(6, darken(col, 0.08), darken(col, 0.3), null);
      } else if (species === "aster") {
        ring(24, 44, 4, col, true, 0, true);
        ring(24, 34, 4, lighten(col, 0.14), true, 0.13, true);
        disc(10, "#ffd24a", "#d8881c", "150,96,24");
      } else if (species === "buttercup") {
        ring(5, 40, 22, col, true, 0, true);
        ring(5, 30, 18, lighten(col, 0.16), true, 0.3, true);
        disc(7, "#ffe27a", "#e0a32a", "150,110,20");
      } else if (species === "zinnia") {
        ring(14, 44, 12, col, true, 0, true);
        ring(12, 34, 11, lighten(col, 0.08), true, 0.2, true);
        ring(10, 24, 10, col, true, 0.12, true);
        disc(8, "#ffce42", "#d98e20", "150,100,24");
      } else if (species === "ranunculus") {
        for (let rk = 5; rk >= 1; rk--) {
          ring(Math.max(5, rk * 4), 10 + rk * 7, 9, rk >= 4 ? lighten(col, 0.08) : col, true, rand(), false);
        }
        disc(5, darken(col, 0.06), darken(col, 0.2), null);
      } else {
        ring(8, 42, 7, col, true, 0, true);
        ring(8, 30, 6, lighten(col, 0.1), true, 0.2, true);
        disc(7, "#3a4f9a", "#1f2c64", "40,52,120");
      }
      x.restore();
      return tex(c);
    }
    function makeGround() {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const x = c.getContext("2d")!;
      x.fillStyle = "#9ec9a8";
      x.fillRect(0, 0, 512, 512); /* flat base so tiling is seamless — no banding */
      const patch = ["#7fb18c", "#aed7b6", "#6fa57e", "#c2e3c8", "#88bd95"];
      for (let p = 0; p < 72; p++) {
        x.globalAlpha = 0.06 + rand() * 0.1;
        x.fillStyle = patch[(rand() * patch.length) | 0];
        const bx = rand() * 512,
          by = rand() * 512,
          r = 28 + rand() * 130;
        x.beginPath();
        x.ellipse(bx, by, r, r * 0.66, rand() * 3, 0, 6.28);
        x.fill();
      }
      x.globalAlpha = 1;
      const blade = ["#5a9a6f", "#6fae7f", "#4f9466", "#82bd91", "#3e7c4f", "#9bcaa6"];
      for (let i = 0; i < 9000; i++) {
        x.globalAlpha = 0.12 + rand() * 0.22;
        x.strokeStyle = blade[(rand() * blade.length) | 0];
        x.lineWidth = 0.9 + rand() * 0.9;
        const px = rand() * 512,
          py = rand() * 512,
          len = 3 + rand() * 8;
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(px + (rand() - 0.5) * 3, py - len);
        x.stroke();
      }
      x.globalAlpha = 1;
      return tex(c);
    }
    function makePath() {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 512;
      const x = c.getContext("2d")!;
      const g = x.createLinearGradient(0, 0, 128, 0);
      g.addColorStop(0, "#b29a78");
      g.addColorStop(0.5, "#d8c39c");
      g.addColorStop(1, "#b29a78");
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 512);
      for (let i = 0; i < 2800; i++) {
        const t = rand();
        x.fillStyle = t > 0.66 ? "#c9b48d" : t > 0.33 ? "#a98e68" : "#e6d7b4";
        x.globalAlpha = 0.45 + rand() * 0.45;
        const gx = rand() * 128,
          gy = rand() * 512,
          r = 0.7 + rand() * 2.4;
        x.beginPath();
        x.arc(gx, gy, r, 0, 6.28);
        x.fill();
      }
      x.globalAlpha = 1;
      x.strokeStyle = "rgba(108,84,54,.22)";
      x.lineWidth = 2;
      for (let j = 1; j < 10; j++) {
        const yy = j * 52 + (rand() - 0.5) * 14;
        x.beginPath();
        x.moveTo(0, yy);
        for (let s = 0; s <= 128; s += 16) {
          x.lineTo(s, yy + (rand() - 0.5) * 7);
        }
        x.stroke();
      }
      const eg = x.createLinearGradient(0, 0, 128, 0);
      eg.addColorStop(0, "rgba(66,52,32,.42)");
      eg.addColorStop(0.13, "rgba(66,52,32,0)");
      eg.addColorStop(0.87, "rgba(66,52,32,0)");
      eg.addColorStop(1, "rgba(66,52,32,.42)");
      x.fillStyle = eg;
      x.fillRect(0, 0, 128, 512);
      return tex(c);
    }
    function makeGrass() {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d")!;
      x.lineCap = "round";
      const cols = ["#4f9466", "#6fae7f", "#3e7c4f", "#82bd91", "#5a9a6f"];
      for (let i = 0; i < 26; i++) {
        const bx = 8 + rand() * 112,
          h = 40 + rand() * 84,
          c1 = cols[(rand() * cols.length) | 0];
        const g = x.createLinearGradient(bx, 128, bx, 128 - h);
        g.addColorStop(0, darken(c1, 0.16));
        g.addColorStop(1, lighten(c1, 0.12));
        x.strokeStyle = g;
        x.lineWidth = 2.2 + rand() * 2.2;
        x.beginPath();
        x.moveTo(bx, 128);
        x.quadraticCurveTo(bx + (rand() - 0.5) * 26, 128 - h * 0.6, bx + (rand() - 0.5) * 34, 128 - h);
        x.stroke();
      }
      return tex(c);
    }

    /* ground + path */
    const gt = makeGround();
    gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
    gt.repeat.set(8, 22);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 320), new THREE.MeshBasicMaterial({ map: gt }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, GROUND_Y, -118);
    scene.add(ground);
    const pt = makePath();
    pt.wrapS = pt.wrapT = THREE.RepeatWrapping;
    pt.repeat.set(1, 13);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(7, 320), new THREE.MeshBasicMaterial({ map: pt }));
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, GROUND_Y + 0.02, -118);
    scene.add(path);

    /* flower clusters (species varied, warm-led) */
    const SPECIES = ["daisy", "cosmos", "poppy", "tulip", "dahlia", "rose", "lavender", "cornflower", "marigold", "aster", "buttercup", "zinnia", "ranunculus", "dahlia", "cosmos", "marigold", "aster", "poppy"];
    const COLORS: Record<string, string[]> = {
      daisy: ["#ffffff"],
      cosmos: ["#e8a0bf", "#f4b8cf", "#ffffff", "#efc1d6"],
      poppy: ["#e0492f", "#e8633a", "#d83b22"],
      tulip: ["#e0607f", "#ef9f54", "#f4b400", "#e0492f", "#e8a0bf"],
      dahlia: ["#d9536f", "#e0607f", "#ef7a54", "#c44569", "#f0a5b4", "#e8633a"],
      rose: ["#e0607f", "#ef9f9a", "#d9536f", "#f0a5b4"],
      lavender: ["#9a7fc4", "#8f78c0", "#b09bd6"],
      cornflower: ["#6f86c9"],
      marigold: ["#ef8a2a", "#f4a300", "#e0631f", "#f6b400"],
      aster: ["#9a7fc4", "#b58fd0", "#6f86c9", "#e8a0bf", "#ffffff"],
      buttercup: ["#f6c41a", "#f4b400"],
      zinnia: ["#e0492f", "#e0607f", "#ef7a54", "#f4b400", "#e8a0bf"],
      ranunculus: ["#ef7a54", "#e0607f", "#f4b400", "#f0a5b4", "#ffffff"],
    };
    const flowers = new THREE.Group();
    scene.add(flowers);
    const texCache: Record<string, THREE.Texture> = {};
    function flowerTex(sp: string, col: string) {
      const k = sp + col;
      if (!texCache[k]) texCache[k] = makeFlower(sp, col);
      return texCache[k];
    }
    const CLUSTERS = MOBILE ? 80 : 208;
    for (let cI = 0; cI < CLUSTERS; cI++) {
      const sp = pick(SPECIES),
        col = pick(COLORS[sp] || ["#e0607f"]);
      const ftx = flowerTex(sp, col);
      const side = rand() > 0.5 ? 1 : -1,
        cxp = side * rr(3.6, 34),
        czp = rr(Z_NEAR, Z_FAR);
      const per = MOBILE ? 3 + ((rand() * 3) | 0) : 4 + ((rand() * 4) | 0);
      for (let f = 0; f < per; f++) {
        const hgt = rr(1.2, 2.6) * (sp === "lavender" ? 1.15 : 1),
          wid = hgt * 0.5;
        const mat = new THREE.MeshBasicMaterial({ map: ftx, transparent: true, alphaTest: 0.42, side: THREE.DoubleSide, depthWrite: true });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(wid, hgt), mat);
        m.position.set(cxp + rr(-2.6, 2.6), GROUND_Y + hgt / 2, czp + rr(-3.2, 3.2));
        m.userData = { ph: rr(0, 6.28), sway: rr(0.02, 0.06) };
        flowers.add(m);
      }
    }

    /* ---- leafy plants: ferns, shrubs, monstera, succulents, hostas, reeds, trees ---- */
    function makePlant(species: string, col: string | null) {
      const c = document.createElement("canvas");
      c.width = 260;
      c.height = 468;
      const x = c.getContext("2d")!;
      x.scale(1.3, 1.3);
      x.lineJoin = "round";
      const GREENS = ["#3e7c4f", "#2c694e", "#4f9466", "#5a9a6f", "#357a52", "#6fae7f"];
      function gleaf(px: number, py: number, len: number, wid: number, ang: number, cIn: string, cOut: string) {
        x.save();
        x.translate(px, py);
        x.rotate(ang);
        const g = x.createLinearGradient(0, 0, 0, -len);
        g.addColorStop(0, darken(cOut, 0.12));
        g.addColorStop(0.5, cIn);
        g.addColorStop(1, lighten(cIn, 0.16));
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(0, 0);
        x.quadraticCurveTo(wid, -len * 0.5, 0, -len);
        x.quadraticCurveTo(-wid, -len * 0.5, 0, 0);
        x.fill();
        x.strokeStyle = "rgba(18,46,30,.30)";
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(0, -2);
        x.lineTo(0, -len * 0.92);
        x.stroke();
        x.restore();
      }
      const bx = 100,
        by = 344;
      if (species === "fern") {
        for (let fr = 0; fr < 7; fr++) {
          const ang = (fr / 6 - 0.5) * 1.5,
            L = 150 + rand() * 90;
          x.save();
          x.translate(bx, by);
          x.rotate(ang);
          x.strokeStyle = "#357a52";
          x.lineWidth = 3;
          x.beginPath();
          x.moveTo(0, 0);
          x.quadraticCurveTo(20, -L * 0.6, 6, -L);
          x.stroke();
          for (let lf = 1; lf < 11; lf++) {
            const ty = (-L * lf) / 11,
              tw = 10 * (1 - lf / 13);
            gleaf(lf * 1.6, ty, 16, tw, 0.9, "#4f9466", "#357a52");
            gleaf(-(lf * 1.0), ty, 16, tw, -0.9, "#4f9466", "#357a52");
          }
          x.restore();
        }
      } else if (species === "shrub") {
        for (let s2 = 0; s2 < 60; s2++) {
          gleaf(bx + (rand() - 0.5) * 150, by - (60 + rand() * 150) + 30, 24 + rand() * 16, 10, (rand() - 0.5) * 2, GREENS[(rand() * GREENS.length) | 0], "#2c694e");
        }
        if (col) {
          x.fillStyle = col;
          for (let b = 0; b < 7; b++) {
            x.beginPath();
            x.arc(bx + (rand() - 0.5) * 120, by - 60 - rand() * 120, 4, 0, 6.28);
            x.fill();
          }
        }
      } else if (species === "monstera") {
        for (let ml = 0; ml < 3; ml++) {
          gleaf(bx, by - 40, 150 + ml * 10, 60, (ml - 1) * 0.5, "#3e7c4f", "#1f5236");
        }
        x.globalCompositeOperation = "destination-out";
        for (let sp2 = 0; sp2 < 10; sp2++) {
          x.beginPath();
          x.arc(bx + (rand() - 0.5) * 90, by - 80 - rand() * 150, 10 + rand() * 8, 0, 6.28);
          x.fill();
        }
        x.globalCompositeOperation = "source-over";
      } else if (species === "succulent") {
        const cy2 = by - 60;
        for (let su = 0; su < 11; su++) {
          x.save();
          x.translate(bx, cy2);
          x.rotate((su / 11) * 6.283);
          const g2 = x.createLinearGradient(0, 0, 0, -70);
          g2.addColorStop(0, "#6fae7f");
          g2.addColorStop(0.8, "#4f9466");
          g2.addColorStop(1, col || "#c76b4f");
          x.fillStyle = g2;
          x.beginPath();
          x.moveTo(0, 0);
          x.quadraticCurveTo(11, -46, 0, -72);
          x.quadraticCurveTo(-11, -46, 0, 0);
          x.fill();
          x.restore();
        }
      } else if (species === "hosta") {
        for (let ho = 0; ho < 7; ho++) {
          const a2 = (ho / 6 - 0.5) * 1.7;
          gleaf(bx, by, 120 + rand() * 50, 34, a2, "#5a9a6f", "#357a52");
          x.save();
          x.translate(bx, by);
          x.rotate(a2);
          x.strokeStyle = "rgba(255,255,255,.22)";
          x.lineWidth = 2;
          x.beginPath();
          x.moveTo(0, 0);
          x.lineTo(0, -130);
          x.stroke();
          x.restore();
        }
      } else if (species === "reed") {
        for (let re = 0; re < 6; re++) {
          const rxx = (re - 2.5) * 9;
          x.strokeStyle = "#6fae7f";
          x.lineWidth = 4;
          x.lineCap = "round";
          const tipx = bx + rxx + (rand() - 0.5) * 30;
          x.beginPath();
          x.moveTo(bx + rxx, by);
          x.quadraticCurveTo(bx + rxx + (rand() - 0.5) * 20, by - 150, tipx, by - 250);
          x.stroke();
          x.fillStyle = col || "#e7d3a8";
          x.save();
          x.translate(tipx, by - 258);
          x.beginPath();
          x.ellipse(0, 0, 9, 26, 0, 0, 6.28);
          x.fill();
          x.restore();
        }
      } else if (species === "palm") {
        for (let pf = 0; pf < 9; pf++) {
          const pang = (pf / 8 - 0.5) * 2.0,
            PL = 170 + rand() * 80;
          x.save();
          x.translate(bx, by);
          x.rotate(pang);
          x.strokeStyle = "#2f7048";
          x.lineWidth = 4;
          x.lineCap = "round";
          x.beginPath();
          x.moveTo(0, 0);
          x.quadraticCurveTo(26, -PL * 0.6, 8, -PL);
          x.stroke();
          for (let pl = 2; pl < 13; pl++) {
            const py2 = (-PL * pl) / 13,
              pw2 = 18 * (1 - pl / 15);
            gleaf(pl * 2.0, py2, 26, pw2, 1.05, "#4f9466", "#2c694e");
            gleaf(-(pl * 1.4), py2, 26, pw2, -1.05, "#4f9466", "#2c694e");
          }
          x.restore();
        }
      } else if (species === "cactus") {
        const pad = (px: number, py: number, w: number, h: number) => {
          const g = x.createLinearGradient(px - w, 0, px + w, 0);
          g.addColorStop(0, "#2c694e");
          g.addColorStop(0.5, "#56a074");
          g.addColorStop(1, "#2c694e");
          x.fillStyle = g;
          x.beginPath();
          x.moveTo(px - w, py);
          x.lineTo(px + w, py);
          x.quadraticCurveTo(px + w + 3, py - h * 0.5, px, py - h);
          x.quadraticCurveTo(px - w - 3, py - h * 0.5, px - w, py);
          x.fill();
          x.strokeStyle = "rgba(255,255,255,.12)";
          x.lineWidth = 1.2;
          for (let rgi = -1; rgi < 2; rgi++) {
            x.beginPath();
            x.moveTo(px + rgi * w * 0.45, py - 5);
            x.lineTo(px + rgi * w * 0.45, py - h * 0.92);
            x.stroke();
          }
        };
        pad(bx, by, 17, 160);
        pad(bx - 24, by - 66, 9, 58);
        pad(bx + 24, by - 86, 9, 50);
        if (col) {
          for (let cf = 0; cf < 3; cf++) {
            const cgx = bx + (cf - 1) * 12,
              cgy = by - 160;
            const g3 = x.createRadialGradient(cgx - 2, cgy - 2, 0, cgx, cgy, 7);
            g3.addColorStop(0, lighten(col, 0.2));
            g3.addColorStop(1, col);
            x.fillStyle = g3;
            x.beginPath();
            x.arc(cgx, cgy, 6, 0, 6.28);
            x.fill();
          }
        }
      } else {
        /* topiary tree */
        x.strokeStyle = "#6b4a2e";
        x.lineWidth = 14;
        x.lineCap = "round";
        x.beginPath();
        x.moveTo(bx, by);
        x.lineTo(bx, by - 150);
        x.stroke();
        for (let tc = 0; tc < 72; tc++) {
          const aa2 = rand() * 6.28,
            rr4 = rand() * 70;
          gleaf(bx + Math.cos(aa2) * rr4, by - 140 + Math.sin(aa2) * rr4 * 0.9, 26, 12, rand() * 6.28, GREENS[(rand() * GREENS.length) | 0], "#1f5236");
        }
      }
      return tex(c);
    }
    const PSPECIES = ["fern", "shrub", "shrub", "monstera", "succulent", "hosta", "reed", "fern", "hosta", "palm", "cactus", "palm", "shrub", "fern"];
    const PCOL: Record<string, (string | null)[]> = {
      shrub: ["#ffffff", "#e8a0bf", "#f4b400", null, null],
      succulent: ["#c76b4f", "#d9826a"],
      reed: ["#e7d3a8", "#dcc79a"],
      cactus: ["#e0607f", "#f4b400", "#ef7a54", null, null],
    };
    const ptexCache: Record<string, THREE.Texture> = {};
    function plantTex(sp: string, col: string | null) {
      const k = sp + col;
      if (!ptexCache[k]) ptexCache[k] = makePlant(sp, col);
      return ptexCache[k];
    }
    const PCLUSTERS = MOBILE ? 52 : 136;
    for (let pc = 0; pc < PCLUSTERS; pc++) {
      const psp = pick(PSPECIES),
        pcol = PCOL[psp] ? pick(PCOL[psp]) : null,
        ptx = plantTex(psp, pcol);
      const pside = rand() > 0.5 ? 1 : -1,
        pcx = pside * rr(4, 37),
        pcz = rr(Z_NEAR, Z_FAR),
        pper = MOBILE ? 2 + ((rand() * 2) | 0) : 2 + ((rand() * 4) | 0);
      for (let pp2 = 0; pp2 < pper; pp2++) {
        const ph2 = rr(1.7, 3.4) * (psp === "reed" ? 1.3 : 1),
          pw = ph2 * (psp === "monstera" ? 0.85 : 0.78);
        const pm = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph2), new THREE.MeshBasicMaterial({ map: ptx, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true }));
        pm.position.set(pcx + rr(-2.4, 2.4), GROUND_Y + ph2 / 2, pcz + rr(-3, 3));
        pm.userData = { ph: rr(0, 6.28), sway: rr(0.015, 0.04) };
        flowers.add(pm);
      }
    }
    /* background topiary trees for depth */
    const TREES = MOBILE ? 18 : 56;
    for (let tr = 0; tr < TREES; tr++) {
      const ttx = plantTex("tree", null),
        th = rr(5, 9),
        tw = th * 0.7,
        tside = rand() > 0.5 ? 1 : -1;
      const tm = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), new THREE.MeshBasicMaterial({ map: ttx, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true }));
      tm.position.set(tside * rr(12, 42), GROUND_Y + th / 2, rr(Z_NEAR - 20, Z_FAR));
      tm.userData = { ph: rr(0, 6.28), sway: rr(0.008, 0.02) };
      flowers.add(tm);
    }

    /* ---- terracotta pots planted with flowers & foliage, lining the path ---- */
    function makePotted(col: string | null) {
      const c = document.createElement("canvas");
      c.width = 260;
      c.height = 468;
      const x = c.getContext("2d")!;
      x.scale(1.3, 1.3);
      x.lineJoin = "round";
      const GREENS = ["#3e7c4f", "#2c694e", "#4f9466", "#5a9a6f", "#357a52"];
      function leafE(px: number, py: number, len: number, wid: number, ang: number, cIn: string, cOut: string) {
        x.save();
        x.translate(px, py);
        x.rotate(ang);
        const g = x.createLinearGradient(0, 0, 0, -len);
        g.addColorStop(0, darken(cOut, 0.1));
        g.addColorStop(0.5, cIn);
        g.addColorStop(1, lighten(cIn, 0.15));
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(0, 0);
        x.quadraticCurveTo(wid, -len * 0.5, 0, -len);
        x.quadraticCurveTo(-wid, -len * 0.5, 0, 0);
        x.fill();
        x.strokeStyle = "rgba(18,46,30,.28)";
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(0, -2);
        x.lineTo(0, -len * 0.9);
        x.stroke();
        x.restore();
      }
      function bloom(px: number, py: number, r: number, cc: string) {
        for (let i = 0; i < 7; i++) {
          x.save();
          x.translate(px, py);
          x.rotate((i / 7) * 6.283);
          const g = x.createLinearGradient(0, 0, 0, -r * 2);
          g.addColorStop(0, darken(cc, 0.18));
          g.addColorStop(1, lighten(cc, 0.18));
          x.fillStyle = g;
          x.beginPath();
          x.ellipse(0, -r, r * 0.52, r, 0, 0, 6.28);
          x.fill();
          x.restore();
        }
        const cg = x.createRadialGradient(px - r * 0.2, py - r * 0.2, 1, px, py, r * 0.6);
        cg.addColorStop(0, "#ffe27a");
        cg.addColorStop(1, "#e0992a");
        x.fillStyle = cg;
        x.beginPath();
        x.arc(px, py, r * 0.5, 0, 6.28);
        x.fill();
      }
      for (let i = 0; i < 34; i++) {
        leafE(100 + (rand() - 0.5) * 120, 250 - rand() * 180, 30 + rand() * 18, 11, (rand() - 0.5) * 2, GREENS[(rand() * GREENS.length) | 0], "#2c694e");
      }
      if (col) {
        for (let f = 0; f < 5; f++) {
          bloom(100 + (rand() - 0.5) * 100, 250 - 40 - rand() * 150, 12 + rand() * 5, col);
        }
      }
      const potTop = 250,
        potBot = 344;
      const grd = x.createLinearGradient(0, potTop, 0, potBot);
      grd.addColorStop(0, "#cf7350");
      grd.addColorStop(1, "#a85533");
      x.fillStyle = grd;
      x.beginPath();
      x.moveTo(58, potTop + 8);
      x.lineTo(142, potTop + 8);
      x.lineTo(128, potBot);
      x.lineTo(72, potBot);
      x.closePath();
      x.fill();
      x.fillStyle = "#d67e58";
      x.beginPath();
      x.moveTo(52, potTop);
      x.lineTo(148, potTop);
      x.lineTo(143, potTop + 14);
      x.lineTo(57, potTop + 14);
      x.closePath();
      x.fill();
      x.fillStyle = "#5a3f2a";
      x.beginPath();
      x.ellipse(100, potTop + 9, 46, 7, 0, 0, 6.28);
      x.fill();
      x.fillStyle = "rgba(0,0,0,.12)";
      x.beginPath();
      x.moveTo(106, potTop + 14);
      x.lineTo(142, potTop + 8);
      x.lineTo(128, potBot);
      x.lineTo(113, potBot);
      x.closePath();
      x.fill();
      return tex(c);
    }
    const potTexCache: Record<string, THREE.Texture> = {};
    function pottedTex(col: string | null) {
      const k = "p" + col;
      if (!potTexCache[k]) potTexCache[k] = makePotted(col);
      return potTexCache[k];
    }
    const POTCOLORS = ["#e0607f", "#ef9f54", "#f4b400", "#e8a0bf", "#d9536f", "#ffffff", null];
    const POTS = MOBILE ? 14 : 36;
    for (let po = 0; po < POTS; po++) {
      const pcoll = pick(POTCOLORS),
        ptex2 = pottedTex(pcoll);
      const poh = rr(1.5, 2.3),
        pow = poh * 0.6,
        poside = rand() > 0.5 ? 1 : -1;
      const pomesh = new THREE.Mesh(new THREE.PlaneGeometry(pow, poh), new THREE.MeshBasicMaterial({ map: ptex2, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true }));
      pomesh.position.set(poside * rr(3.4, 11), GROUND_Y + poh / 2, rr(Z_NEAR, Z_FAR));
      pomesh.userData = { ph: rr(0, 6.28), sway: rr(0.006, 0.016) };
      flowers.add(pomesh);
    }

    /* grass tufts */
    const grassMat = new THREE.MeshBasicMaterial({ map: makeGrass(), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true });
    const grasses = new THREE.Group();
    scene.add(grasses);
    const GN = MOBILE ? 260 : 680;
    for (let gi = 0; gi < GN; gi++) {
      const gh = rr(0.5, 1.15),
        gw = gh * 1.1;
      const gm = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), grassMat);
      const gsd = rand() > 0.5 ? 1 : -1;
      gm.position.set(gsd * rr(2.6, 36), GROUND_Y + gh / 2, rr(Z_NEAR + 4, Z_FAR));
      gm.userData = { ph: rr(0, 6.28), sway: rr(0.05, 0.12) };
      grasses.add(gm);
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      MOBILE = W < 760;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }
    window.addEventListener("resize", resize);

    let camX = 0,
      camY = 0;
    const t0 = performance.now();
    let raf = 0;
    function frame(now: number) {
      const t = (now - t0) / 1000;
      const scrollP = getScrollP();
      const pointer = getPointer();
      const targetZ = CAM_START + (CAM_END - CAM_START) * scrollP;
      camera.position.z += (targetZ - camera.position.z) * 0.06;
      const px = REDUCE ? 0 : pointer.x,
        py = REDUCE ? 0 : pointer.y;
      camX += (px * 2.2 - camX) * 0.04;
      camY += (-py * 1.2 - camY) * 0.04;
      const bob = REDUCE ? 0 : Math.sin(t * 1.7) * 0.07,
        swayX = REDUCE ? 0 : Math.sin(t * 0.85) * 0.18;
      camera.position.x = camX + swayX;
      camera.position.y = camY + bob;
      camera.lookAt(camera.position.x * 0.5, GROUND_Y + 1.4, camera.position.z - 24);

      const fc = flowers.children;
      for (let i = 0; i < fc.length; i++) {
        const f = fc[i];
        const yaw = Math.atan2(camera.position.x - f.position.x, camera.position.z - f.position.z);
        f.rotation.set(0, yaw, REDUCE ? 0 : Math.sin(t * 0.8 + f.userData.ph) * f.userData.sway);
      }
      const gc = grasses.children;
      for (let j = 0; j < gc.length; j++) {
        const gr = gc[j];
        const yw = Math.atan2(camera.position.x - gr.position.x, camera.position.z - gr.position.z);
        gr.rotation.set(0, yw, REDUCE ? 0 : Math.sin(t * 1.3 + gr.userData.ph) * gr.userData.sway);
      }

      const warmth = Math.max(0, Math.min(1, (scrollP - 0.4) / 0.45));
      (scene.fog as THREE.FogExp2).color.copy(colCool).lerp(colWarm, warmth * 0.55);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            (m as THREE.MeshBasicMaterial).map?.dispose();
            m.dispose();
          });
        } else if (mat) {
          (mat as THREE.MeshBasicMaterial).map?.dispose();
          mat.dispose();
        }
      });
      skyTex.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas id="bg" ref={canvasRef} />;
}
