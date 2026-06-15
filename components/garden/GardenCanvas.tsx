"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getScrollP, getPointer } from "@/lib/scrollStore";

/**
 * The procedural "garden walk" background — a lush, naturalistic perennial
 * garden inspired by the reference photo: an irregular flagstone path running
 * clear through layered beds of yellow daylilies, burgundy foliage shrubs,
 * pink / white roses, low pink edging flowers and leafy greens, under a soft
 * hazy sky. No plants sit on the alley itself. Ported into a client component;
 * reads scroll progress + pointer from the shared scroll store each frame and
 * disposes all WebGL resources on unmount. Honors prefers-reduced-motion.
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
    // soft, hazy daylight — pale blue overhead washing to warm green-grey near the horizon
    const skyC = document.createElement("canvas");
    skyC.width = 4;
    skyC.height = 256;
    const sxc = skyC.getContext("2d")!;
    const sg = sxc.createLinearGradient(0, 0, 0, 256);
    sg.addColorStop(0, "#b9d0da");
    sg.addColorStop(0.5, "#d4e0da");
    sg.addColorStop(0.8, "#e3ead9");
    sg.addColorStop(1, "#edf0e0");
    sxc.fillStyle = sg;
    sxc.fillRect(0, 0, 4, 256);
    const skyTex = new THREE.Texture(skyC);
    skyTex.needsUpdate = true;
    scene.background = skyTex;
    const colCool = new THREE.Color(0xdfe8d6),
      colWarm = new THREE.Color(0xe6e3d0);
    scene.fog = new THREE.FogExp2(0xdfe8d6, MOBILE ? 0.015 : 0.011);

    const GROUND_Y = -2.0,
      Z_NEAR = 14,
      Z_FAR = -265,
      CAM_START = 10,
      CAM_END = -250,
      EDGE = 4.4; // path half-width is 4; keep all flora off the alley
    const camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 700);
    camera.position.set(0, 0, CAM_START);
    scene.add(new THREE.AmbientLight(0xffffff, 1.02));
    const sunL = new THREE.DirectionalLight(0xfff2da, 0.6);
    sunL.position.set(-5, 11, 5);
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

    /* --- color helpers --- */
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

    const GREENS = ["#3e7c4f", "#2c694e", "#4f9466", "#5a9a6f", "#357a52", "#6aa777", "#2f6b45", "#46885a"];
    const BURGUNDY = ["#6e2740", "#7d2b3a", "#5c2336", "#8a3a4a", "#9b4a52", "#71304a", "#5a2030"];
    const ROSE = ["#cc2b2b", "#d6342f", "#e0392f", "#c92a4e", "#d83a5e", "#e24b74", "#cf2d52", "#e85a86", "#d22f3f", "#c0263f", "#ffffff", "#f3c6d4"];
    const PINKS = ["#e85a86", "#ef6f9a", "#f49ab6", "#ffffff", "#f06f7a", "#e24b74", "#f3c6d4"];
    const YELLOWS = ["#f4b400", "#f6c41a", "#efa52a", "#f0922a", "#f7b733"];

    /* domed mound of small leaves; returns maxH(u) so callers can place blooms */
    function leafDome(x: CanvasRenderingContext2D, cx: number, baseY: number, domeR: number, domeH: number, palette: string[], leafCount: number, leafMin: number, leafMax: number) {
      const maxH = (u: number) => domeH * Math.sqrt(Math.max(0, 1 - u * u * 0.92));
      for (let i = 0; i < leafCount; i++) {
        const u = rand() * 2 - 1;
        const px = cx + u * domeR;
        const h = maxH(u);
        const py = baseY - rand() * h;
        const depth = (baseY - py) / domeH;
        const green = pick(palette);
        const r = leafMin + rand() * (leafMax - leafMin);
        const g = x.createLinearGradient(px, py - r, px, py + r);
        g.addColorStop(0, lighten(green, 0.14 + depth * 0.14));
        g.addColorStop(1, darken(green, 0.12 - depth * 0.05));
        x.fillStyle = g;
        x.save();
        x.translate(px, py);
        x.rotate((rand() - 0.5) * 1.6);
        x.beginPath();
        x.ellipse(0, 0, r * 0.82, r, 0, 0, 6.28);
        x.fill();
        x.restore();
      }
      x.fillStyle = "rgba(20,40,24,.16)";
      x.beginPath();
      x.ellipse(cx, baseY, domeR * 0.78, 15, 0, 0, 6.28);
      x.fill();
      return maxH;
    }

    /* a single rose bloom (rosette) */
    function rosette(x: CanvasRenderingContext2D, px: number, py: number, r: number, col: string) {
      x.save();
      x.translate(px, py);
      x.fillStyle = "rgba(20,40,24,.08)";
      x.beginPath();
      x.arc(0, 0, r * 0.98, 0, 6.28);
      x.fill();
      for (let i = 0; i < 6; i++) {
        x.save();
        x.rotate((i / 6) * 6.283 + (rand() - 0.5) * 0.3);
        const g = x.createLinearGradient(0, 0, 0, -r * 1.1);
        g.addColorStop(0, darken(col, 0.08));
        g.addColorStop(0.7, col);
        g.addColorStop(1, lighten(col, 0.12));
        x.fillStyle = g;
        x.beginPath();
        x.ellipse(0, -r * 0.52, r * 0.46, r * 0.66, 0, 0, 6.28);
        x.fill();
        x.restore();
      }
      for (let i = 0; i < 5; i++) {
        x.save();
        x.rotate((i / 5) * 6.283 + 0.4);
        x.fillStyle = col;
        x.beginPath();
        x.ellipse(0, -r * 0.34, r * 0.34, r * 0.46, 0, 0, 6.28);
        x.fill();
        x.restore();
      }
      for (let i = 0; i < 4; i++) {
        x.save();
        x.rotate((i / 4) * 6.283 + 0.2);
        x.fillStyle = lighten(col, 0.12);
        x.beginPath();
        x.ellipse(0, -r * 0.2, r * 0.24, r * 0.32, 0, 0, 6.28);
        x.fill();
        x.restore();
      }
      x.fillStyle = darken(col, 0.16);
      x.beginPath();
      x.arc(0, 0, r * 0.16, 0, 6.28);
      x.fill();
      x.restore();
    }

    /* a small 5-petal floret for edging mounds */
    function floret(x: CanvasRenderingContext2D, px: number, py: number, r: number, col: string) {
      x.save();
      x.translate(px, py);
      for (let i = 0; i < 5; i++) {
        x.save();
        x.rotate((i / 5) * 6.283 + rand() * 0.3);
        x.fillStyle = i % 2 ? col : lighten(col, 0.1);
        x.beginPath();
        x.ellipse(0, -r * 0.6, r * 0.42, r * 0.6, 0, 0, 6.28);
        x.fill();
        x.restore();
      }
      x.fillStyle = "#f5d23a";
      x.beginPath();
      x.arc(0, 0, r * 0.26, 0, 6.28);
      x.fill();
      x.restore();
    }

    /* a 6-petal daylily/lily star flower */
    function dayflower(x: CanvasRenderingContext2D, px: number, py: number, r: number, col: string) {
      x.save();
      x.translate(px, py);
      x.rotate(rand() * 6.28);
      for (let i = 0; i < 6; i++) {
        x.save();
        x.rotate((i / 6) * 6.283);
        const g = x.createLinearGradient(0, 0, 0, -r * 1.5);
        g.addColorStop(0, darken(col, 0.12));
        g.addColorStop(0.5, col);
        g.addColorStop(1, lighten(col, 0.18));
        x.fillStyle = g;
        x.beginPath();
        x.ellipse(0, -r * 0.72, r * 0.24, r * 0.82, 0, 0, 6.28);
        x.fill();
        x.restore();
      }
      // reddish throat + stamens
      x.fillStyle = "#a8431c";
      x.beginPath();
      x.arc(0, 0, r * 0.2, 0, 6.28);
      x.fill();
      x.strokeStyle = "#7a3414";
      x.lineWidth = 1.2;
      for (let s = 0; s < 5; s++) {
        x.save();
        x.rotate((s / 5) * 6.283 + 0.3);
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(0, -r * 0.34);
        x.stroke();
        x.restore();
      }
      x.restore();
    }

    /* ---- plant texture makers ---- */
    function makeRoseBush(col: string) {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 280;
      const x = c.getContext("2d")!;
      const cx = 160,
        baseY = 270;
      const maxH = leafDome(x, cx, baseY, 138, 214, GREENS, 320, 8, 20);
      const blooms = 44 + ((rand() * 22) | 0);
      for (let b = 0; b < blooms; b++) {
        const u = rand() * 1.8 - 0.9;
        const px = cx + u * 138 * 0.94;
        const py = baseY - (0.12 + rand() * 0.84) * maxH(u);
        let bc = col;
        const roll = rand();
        if (roll < 0.07) bc = "#ffffff";
        else bc = roll < 0.55 ? col : rand() < 0.5 ? lighten(col, 0.08) : darken(col, 0.07);
        rosette(x, px, py, 11 + rand() * 10, bc);
      }
      return tex(c);
    }

    function makeLeafyShrub() {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 320;
      const x = c.getContext("2d")!;
      leafDome(x, 160, 308, 144, 250, GREENS, 420, 9, 22);
      return tex(c);
    }

    function makeBurgundyShrub() {
      const c = document.createElement("canvas");
      c.width = 300;
      c.height = 240;
      const x = c.getContext("2d")!;
      // mostly burgundy leaves with a few dark-green ones woven in
      const pal = BURGUNDY.concat(["#3a5a3e", "#33513a"]);
      leafDome(x, 150, 230, 130, 178, pal, 360, 6, 13);
      return tex(c);
    }

    function makePinkMound(col: string) {
      const c = document.createElement("canvas");
      c.width = 300;
      c.height = 200;
      const x = c.getContext("2d")!;
      const cx = 150,
        baseY = 192;
      // low, wide mound of foliage
      const maxH = leafDome(x, cx, baseY, 140, 138, GREENS, 220, 7, 14);
      const blooms = 60 + ((rand() * 30) | 0);
      for (let b = 0; b < blooms; b++) {
        const u = rand() * 1.9 - 0.95;
        const px = cx + u * 140 * 0.95;
        const py = baseY - (0.1 + rand() * 0.9) * maxH(u);
        const bc = rand() < 0.16 ? "#ffffff" : col;
        floret(x, px, py, 6 + rand() * 6, bc);
      }
      return tex(c);
    }

    function makeDaylily(col: string) {
      const c = document.createElement("canvas");
      c.width = 300;
      c.height = 300;
      const x = c.getContext("2d")!;
      const cx = 150,
        by = 292;
      // strappy blades fanning from the base
      for (let i = 0; i < 30; i++) {
        const u = (i / 29 - 0.5) * 1.35;
        const L = 150 + rand() * 120;
        const tipx = cx + u * 110 + (rand() - 0.5) * 20;
        const g = x.createLinearGradient(cx, by, tipx, by - L);
        const gr = pick(["#3e7c4f", "#357a52", "#4f9466", "#2c694e", "#46885a"]);
        g.addColorStop(0, darken(gr, 0.14));
        g.addColorStop(1, lighten(gr, 0.16));
        x.strokeStyle = g;
        x.lineWidth = 3 + rand() * 3;
        x.lineCap = "round";
        x.beginPath();
        x.moveTo(cx + (rand() - 0.5) * 12, by);
        x.quadraticCurveTo(cx + u * 70, by - L * 0.6, tipx, by - L);
        x.stroke();
      }
      // flowers near the crown
      const fl = 4 + ((rand() * 4) | 0);
      for (let f = 0; f < fl; f++) {
        const fx = cx + (rand() - 0.5) * 80;
        const fy = 96 + rand() * 80;
        dayflower(x, fx, fy, 16 + rand() * 9, pick(YELLOWS));
      }
      return tex(c);
    }

    /* a terracotta pot planted with foliage + flowers */
    function makePottedPlant(col: string) {
      const c = document.createElement("canvas");
      c.width = 200;
      c.height = 280;
      const x = c.getContext("2d")!;
      const cx = 100,
        rimY = 170;
      // foliage rising out of the pot
      const maxH = leafDome(x, cx, rimY, 64, 118, GREENS, 130, 6, 12);
      // flowers
      const yellow = col === "#f4b400" || col === "#f6c41a";
      const blooms = 12 + ((rand() * 8) | 0);
      for (let b = 0; b < blooms; b++) {
        const u = rand() * 1.7 - 0.85;
        const px = cx + u * 60;
        const py = rimY - (0.15 + rand() * 0.82) * maxH(u);
        if (yellow) dayflower(x, px, py, 7 + rand() * 4, col);
        else if (rand() < 0.5) rosette(x, px, py, 7 + rand() * 5, col);
        else floret(x, px, py, 5 + rand() * 4, col);
      }
      // terracotta pot
      const top = 166,
        bot = 272,
        htop = 50,
        hbot = 36;
      const g = x.createLinearGradient(0, top, 0, bot);
      g.addColorStop(0, "#cf7350");
      g.addColorStop(1, "#a85533");
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(cx - htop, top + 8);
      x.lineTo(cx + htop, top + 8);
      x.lineTo(cx + hbot, bot);
      x.lineTo(cx - hbot, bot);
      x.closePath();
      x.fill();
      // rim
      x.fillStyle = "#d67e58";
      x.beginPath();
      x.moveTo(cx - htop - 4, top);
      x.lineTo(cx + htop + 4, top);
      x.lineTo(cx + htop - 2, top + 14);
      x.lineTo(cx - htop + 2, top + 14);
      x.closePath();
      x.fill();
      // soil
      x.fillStyle = "#5a3f2a";
      x.beginPath();
      x.ellipse(cx, top + 9, htop - 4, 7, 0, 0, 6.28);
      x.fill();
      // right-side shading
      x.fillStyle = "rgba(0,0,0,.12)";
      x.beginPath();
      x.moveTo(cx + 6, top + 12);
      x.lineTo(cx + htop, top + 8);
      x.lineTo(cx + hbot, bot);
      x.lineTo(cx + 4, bot);
      x.closePath();
      x.fill();
      return tex(c);
    }

    /* a soft rounded canopy tree for the background treeline */
    function makeCanopyTree(tall: boolean) {
      const c = document.createElement("canvas");
      c.width = 300;
      c.height = 380;
      const x = c.getContext("2d")!;
      const cx = 150,
        by = 372;
      x.strokeStyle = "#6b5238";
      x.lineWidth = 13;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(cx, by);
      x.lineTo(cx + (rand() - 0.5) * 14, by - (tall ? 150 : 96));
      x.stroke();
      const canopyCy = tall ? 150 : 196,
        canopyRx = tall ? 96 : 124,
        canopyRy = tall ? 150 : 128;
      const treeGreens = ["#2f6b45", "#357a52", "#3e7c4f", "#46885a", "#295f3d", "#508f64"];
      for (let i = 0; i < 150; i++) {
        const a = rand() * 6.283,
          rad = Math.sqrt(rand());
        const px = cx + Math.cos(a) * rad * canopyRx;
        const py = canopyCy - Math.sin(a) * rad * canopyRy * 0.92;
        const depth = (canopyCy - py) / canopyRy;
        const r = 16 + rand() * 30;
        const g = x.createRadialGradient(px - r * 0.3, py - r * 0.3, 1, px, py, r);
        g.addColorStop(0, lighten(pick(treeGreens), 0.08 + Math.max(0, depth) * 0.16));
        g.addColorStop(1, darken(pick(treeGreens), 0.12));
        x.fillStyle = g;
        x.beginPath();
        x.arc(px, py, r, 0, 6.28);
        x.fill();
      }
      return tex(c);
    }

    /* a cosy gable-front cottage on a transparent ground */
    function makeHouse() {
      const c = document.createElement("canvas");
      c.width = 460;
      c.height = 460;
      const x = c.getContext("2d")!;
      const cx = 230,
        left = 92,
        right = 368,
        wallTop = 214,
        base = 440,
        apex = 104;

      // ground shadow
      x.fillStyle = "rgba(18,36,22,.20)";
      x.beginPath();
      x.ellipse(cx, 448, 172, 20, 0, 0, 6.28);
      x.fill();

      // gable triangle wall
      const wallCol = "#ece1cb";
      x.fillStyle = wallCol;
      x.beginPath();
      x.moveTo(left, wallTop);
      x.lineTo(cx, apex);
      x.lineTo(right, wallTop);
      x.closePath();
      x.fill();
      x.fillStyle = "rgba(0,0,0,.07)"; // shade the right half of the gable
      x.beginPath();
      x.moveTo(cx, apex);
      x.lineTo(right, wallTop);
      x.lineTo(cx, wallTop);
      x.closePath();
      x.fill();

      // body wall with a soft side-to-side gradient
      const wg = x.createLinearGradient(left, 0, right, 0);
      wg.addColorStop(0, lighten(wallCol, 0.05));
      wg.addColorStop(0.6, wallCol);
      wg.addColorStop(1, darken(wallCol, 0.1));
      x.fillStyle = wg;
      x.fillRect(left, wallTop, right - left, base - wallTop);
      // faint plaster grain
      for (let i = 0; i < 70; i++) {
        x.globalAlpha = 0.05;
        x.fillStyle = i % 2 ? "#ffffff" : "#7a6a4e";
        x.fillRect(left + rand() * (right - left), wallTop + rand() * (base - wallTop), 4 + rand() * 16, 1.5);
      }
      x.globalAlpha = 1;

      // overhanging roof boards
      x.lineWidth = 22;
      x.lineCap = "round";
      const eaveX = 40,
        eaveY = 24;
      let rg = x.createLinearGradient(left - eaveX, wallTop + eaveY, cx, apex);
      rg.addColorStop(0, "#a8492a");
      rg.addColorStop(1, "#c86c44");
      x.strokeStyle = rg;
      x.beginPath();
      x.moveTo(cx, apex - 6);
      x.lineTo(left - eaveX, wallTop + eaveY);
      x.stroke();
      rg = x.createLinearGradient(cx, apex, right + eaveX, wallTop + eaveY);
      rg.addColorStop(0, "#c86c44");
      rg.addColorStop(1, "#a8492a");
      x.strokeStyle = rg;
      x.beginPath();
      x.moveTo(cx, apex - 6);
      x.lineTo(right + eaveX, wallTop + eaveY);
      x.stroke();

      // chimney + a wisp of smoke
      x.fillStyle = "#8c4a36";
      x.fillRect(right - 78, apex + 34, 30, 84);
      x.fillStyle = "#6f3a2a";
      x.fillRect(right - 82, apex + 28, 38, 12);
      for (let i = 0; i < 4; i++) {
        x.globalAlpha = 0.5 - i * 0.08;
        x.fillStyle = "#dcdcd2";
        x.beginPath();
        x.arc(right - 63 + i * 5, apex + 16 - i * 16, 8 + i * 3, 0, 6.28);
        x.fill();
      }
      x.globalAlpha = 1;

      // arched door
      const dw = 58,
        dh = 104,
        dx = cx - dw / 2,
        dy = base - dh;
      x.fillStyle = "#6f4a2c";
      x.beginPath();
      x.moveTo(dx, base);
      x.lineTo(dx, dy + 24);
      x.arc(cx, dy + 24, dw / 2, Math.PI, 2 * Math.PI);
      x.lineTo(dx + dw, base);
      x.closePath();
      x.fill();
      x.strokeStyle = "rgba(0,0,0,.25)";
      x.lineWidth = 2;
      x.strokeRect(dx + 8, dy + 30, dw - 16, dh - 40);
      x.fillStyle = "#e8c24a"; // brass knob
      x.beginPath();
      x.arc(dx + dw - 15, dy + dh * 0.62, 4, 0, 6.28);
      x.fill();
      x.fillStyle = "#bdb4a0"; // step
      x.fillRect(dx - 10, base - 8, dw + 20, 8);

      // two windows with white mullions, sills and flower boxes
      const drawWindow = (wx: number, wy: number, ww: number, wh: number) => {
        x.fillStyle = "#5b3f28";
        x.fillRect(wx - 5, wy - 5, ww + 10, wh + 10);
        const gg = x.createLinearGradient(wx, wy, wx + ww, wy + wh);
        gg.addColorStop(0, "#c4dadf");
        gg.addColorStop(0.5, "#8fb4bd");
        gg.addColorStop(1, "#6f99a3");
        x.fillStyle = gg;
        x.fillRect(wx, wy, ww, wh);
        x.strokeStyle = "#f3efe6";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(wx + ww / 2, wy);
        x.lineTo(wx + ww / 2, wy + wh);
        x.moveTo(wx, wy + wh / 2);
        x.lineTo(wx + ww, wy + wh / 2);
        x.stroke();
        x.fillStyle = "#cfc6b2"; // sill
        x.fillRect(wx - 8, wy + wh, ww + 16, 8);
        x.fillStyle = "#7a4a2e"; // flower box
        x.fillRect(wx - 6, wy + wh + 8, ww + 12, 13);
        for (let i = 0; i < 6; i++) {
          x.fillStyle = pick(["#e0533a", "#e8a0bf", "#f4b400", "#ffffff"]);
          x.beginPath();
          x.arc(wx - 6 + (i + 0.5) * ((ww + 12) / 6), wy + wh + 8, 5, 0, 6.28);
          x.fill();
        }
      };
      drawWindow(left + 28, wallTop + 46, 72, 82);
      drawWindow(right - 100, wallTop + 46, 72, 82);

      // round gable window
      x.fillStyle = "#5b3f28";
      x.beginPath();
      x.arc(cx, wallTop - 46, 26, 0, 6.28);
      x.fill();
      x.fillStyle = "#9fc2c9";
      x.beginPath();
      x.arc(cx, wallTop - 46, 21, 0, 6.28);
      x.fill();
      x.strokeStyle = "#f3efe6";
      x.lineWidth = 2.5;
      x.beginPath();
      x.moveTo(cx - 21, wallTop - 46);
      x.lineTo(cx + 21, wallTop - 46);
      x.moveTo(cx, wallTop - 67);
      x.lineTo(cx, wallTop - 25);
      x.stroke();

      return tex(c);
    }

    /* a Victorian glasshouse — opaque pale-teal glass so alphaTest stays crisp */
    function makeGreenhouse() {
      const c = document.createElement("canvas");
      c.width = 460;
      c.height = 420;
      const x = c.getContext("2d")!;
      const left = 70,
        right = 390,
        eaveY = 208,
        baseY = 402,
        ridgeY = 70,
        cx = 230;
      const roofYAt = (px: number) => (px < cx ? eaveY + (ridgeY - eaveY) * ((px - left) / (cx - left)) : eaveY + (ridgeY - eaveY) * ((right - px) / (right - cx)));

      // shadow
      x.fillStyle = "rgba(18,36,22,.18)";
      x.beginPath();
      x.ellipse(cx, 410, 190, 18, 0, 0, 6.28);
      x.fill();

      // opaque glass body + roof
      const bg = x.createLinearGradient(0, eaveY, 0, baseY);
      bg.addColorStop(0, "#d7ebe5");
      bg.addColorStop(1, "#bcd9d1");
      x.fillStyle = bg;
      x.fillRect(left, eaveY, right - left, baseY - eaveY);
      x.fillStyle = "#e0efe9";
      x.beginPath();
      x.moveTo(left, eaveY);
      x.lineTo(cx, ridgeY);
      x.lineTo(right, eaveY);
      x.closePath();
      x.fill();

      // hint of plants behind the glass (clipped to the body)
      x.save();
      x.beginPath();
      x.rect(left, eaveY, right - left, baseY - eaveY);
      x.clip();
      for (let i = 0; i < 28; i++) {
        x.globalAlpha = 0.5;
        x.fillStyle = pick(GREENS);
        x.beginPath();
        x.ellipse(left + rand() * (right - left), baseY - rand() * 96, 18 + rand() * 26, 26 + rand() * 30, 0, 0, 6.28);
        x.fill();
      }
      for (let i = 0; i < 12; i++) {
        x.globalAlpha = 0.55;
        x.fillStyle = pick(["#e0533a", "#f4b400", "#e8a0bf", "#ffffff"]);
        x.beginPath();
        x.arc(left + rand() * (right - left), baseY - 20 - rand() * 72, 5 + rand() * 4, 0, 6.28);
        x.fill();
      }
      x.restore();
      x.globalAlpha = 1;

      // diagonal glass sheen
      x.strokeStyle = "rgba(255,255,255,.34)";
      x.lineWidth = 7;
      for (const s of [0, 1]) {
        const ox = left + 26 + s * 150;
        x.beginPath();
        x.moveTo(ox, baseY - 10);
        x.lineTo(ox + 92, eaveY + 12);
        x.stroke();
      }

      // white-green frame: posts, body rails, roof bars, slopes
      const frame = "#eef3ec";
      x.strokeStyle = frame;
      x.lineCap = "square";
      x.lineWidth = 8;
      x.beginPath();
      for (const px of [left, left + (right - left) / 3, cx, right - (right - left) / 3, right]) {
        x.moveTo(px, eaveY);
        x.lineTo(px, baseY);
      }
      x.stroke();
      x.lineWidth = 5;
      for (const py of [eaveY, eaveY + (baseY - eaveY) / 2, baseY]) {
        x.beginPath();
        x.moveTo(left, py);
        x.lineTo(right, py);
        x.stroke();
      }
      x.lineWidth = 7; // roof slopes
      x.beginPath();
      x.moveTo(left, eaveY);
      x.lineTo(cx, ridgeY);
      x.lineTo(right, eaveY);
      x.stroke();
      x.lineWidth = 4; // horizontal roof glazing bars
      for (const t of [0.4, 0.72]) {
        const yl = eaveY + (ridgeY - eaveY) * t;
        x.beginPath();
        x.moveTo(left + (cx - left) * t, yl);
        x.lineTo(right - (right - cx) * t, yl);
        x.stroke();
      }
      x.lineWidth = 4; // central roof bar to ridge
      x.beginPath();
      x.moveTo(cx, ridgeY);
      x.lineTo(cx, eaveY);
      x.stroke();

      // double glass door
      const dw = 72,
        dh = 122,
        dx = cx - dw / 2,
        dy = baseY - dh;
      x.fillStyle = "#cfe6df";
      x.fillRect(dx, dy, dw, dh);
      x.strokeStyle = frame;
      x.lineWidth = 6;
      x.strokeRect(dx, dy, dw, dh);
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(cx, dy);
      x.lineTo(cx, baseY);
      x.moveTo(dx, dy + dh * 0.5);
      x.lineTo(dx + dw, dy + dh * 0.5);
      x.stroke();

      // ridge finial
      x.fillStyle = frame;
      x.beginPath();
      x.arc(cx, ridgeY - 6, 7, 0, 6.28);
      x.fill();
      x.fillRect(cx - 2, ridgeY - 18, 4, 14);
      void roofYAt;

      return tex(c);
    }

    /* a repeating picket-fence panel (tiles horizontally along the garden edge) */
    function makeFence() {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 128;
      const x = c.getContext("2d")!;
      const woodLo = "#cdbfa6",
        woodHi = "#efe6d2";
      const rail = (y: number, h: number) => {
        const g = x.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, woodHi);
        g.addColorStop(1, darken(woodLo, 0.12));
        x.fillStyle = g;
        x.fillRect(0, y, 256, h);
      };
      // two horizontal rails
      rail(44, 13);
      rail(86, 13);
      // pickets with pointed tops
      const picketW = 18,
        gap = 14,
        step = picketW + gap;
      for (let px = 6; px < 256; px += step) {
        const g = x.createLinearGradient(px, 0, px + picketW, 0);
        g.addColorStop(0, woodHi);
        g.addColorStop(0.5, "#e3d8c0");
        g.addColorStop(1, darken(woodLo, 0.16));
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(px, 28);
        x.lineTo(px + picketW / 2, 12);
        x.lineTo(px + picketW, 28);
        x.lineTo(px + picketW, 124);
        x.lineTo(px, 124);
        x.closePath();
        x.fill();
        x.strokeStyle = "rgba(70,54,30,.18)";
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(px + picketW - 1, 28);
        x.lineTo(px + picketW - 1, 124);
        x.stroke();
      }
      return tex(c);
    }

    function makeGround() {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const x = c.getContext("2d")!;
      x.fillStyle = "#a3cba0";
      x.fillRect(0, 0, 512, 512);
      const patch = ["#98c595", "#aed4a8", "#8ebd8a", "#bbddb4", "#a4cf9f", "#7fae7d"];
      for (let p = 0; p < 64; p++) {
        x.globalAlpha = 0.05 + rand() * 0.08;
        x.fillStyle = patch[(rand() * patch.length) | 0];
        const bx = rand() * 512,
          by = rand() * 512,
          r = 30 + rand() * 120;
        x.beginPath();
        x.ellipse(bx, by, r, r * 0.66, rand() * 3, 0, 6.28);
        x.fill();
      }
      x.globalAlpha = 1;
      const blade = ["#5a9a6f", "#6fae7f", "#4f9466", "#82bd91", "#3e7c4f", "#9bcaa6"];
      for (let i = 0; i < 8000; i++) {
        x.globalAlpha = 0.1 + rand() * 0.2;
        x.strokeStyle = blade[(rand() * blade.length) | 0];
        x.lineWidth = 0.9 + rand() * 0.9;
        const px = rand() * 512,
          py = rand() * 512,
          len = 3 + rand() * 7;
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(px + (rand() - 0.5) * 3, py - len);
        x.stroke();
      }
      x.globalAlpha = 1;
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
          h = 36 + rand() * 78,
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

    /* ground + single-color path */
    const gt = makeGround();
    gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
    gt.repeat.set(8, 22);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 320), new THREE.MeshBasicMaterial({ map: gt }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, GROUND_Y, -118);
    scene.add(ground);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(8, 320), new THREE.MeshBasicMaterial({ color: 0xc9c2b2 }));
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, GROUND_Y + 0.02, -118);
    scene.add(path);

    const flowers = new THREE.Group();
    scene.add(flowers);

    // shared billboard-plane helper; clamps flora off the alley
    function addPlant(txt: THREE.Texture, h: number, wRatio: number, x: number, z: number, sway: number) {
      const ax = Math.sign(x || 1) * Math.max(EDGE, Math.abs(x));
      const m = new THREE.Mesh(new THREE.PlaneGeometry(h * wRatio, h), new THREE.MeshBasicMaterial({ map: txt, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true }));
      m.position.set(ax, GROUND_Y + h / 2, z);
      m.userData = { ph: rr(0, 6.28), sway };
      flowers.add(m);
    }

    // texture caches (variant-keyed for variety without redrawing every instance)
    const roseCache: Record<string, THREE.Texture> = {};
    const roseT = (col: string, v: number) => (roseCache[col + v] ||= makeRoseBush(col));
    const pinkCache: Record<string, THREE.Texture> = {};
    const pinkT = (col: string, v: number) => (pinkCache[col + v] ||= makePinkMound(col));
    const dayCache: THREE.Texture[] = [makeDaylily("#f4b400"), makeDaylily("#f6c41a"), makeDaylily("#efa52a")];
    const burgCache: THREE.Texture[] = [makeBurgundyShrub(), makeBurgundyShrub(), makeBurgundyShrub()];
    const leafCache: THREE.Texture[] = [makeLeafyShrub(), makeLeafyShrub(), makeLeafyShrub(), makeLeafyShrub()];

    const f = MOBILE ? 0.4 : 1; // mobile flora scale factor
    const MULT = 3; // density multiplier — ~300% more plants & flowers

    // leafy green shrubs — the lush back of the beds
    for (let i = 0; i < ((80 * f * MULT) | 0); i++) {
      const side = rand() > 0.5 ? 1 : -1;
      addPlant(pick(leafCache), rr(1.8, 3.2), 1.0, side * rr(8, 22), rr(Z_NEAR, Z_FAR), rr(0.01, 0.03));
    }
    // burgundy foliage shrubs
    for (let i = 0; i < ((46 * f * MULT) | 0); i++) {
      const side = rand() > 0.5 ? 1 : -1;
      addPlant(pick(burgCache), rr(1.0, 1.9), 1.15, side * rr(5, 13), rr(Z_NEAR, Z_FAR), rr(0.012, 0.03));
    }
    // pink / white roses
    for (let i = 0; i < ((64 * f * MULT) | 0); i++) {
      const side = rand() > 0.5 ? 1 : -1;
      addPlant(roseT(pick(ROSE), i % 3), rr(1.2, 2.4), 1.2, side * rr(5.5, 14), rr(Z_NEAR, Z_FAR), rr(0.01, 0.025));
    }
    // yellow daylily clumps
    for (let i = 0; i < ((56 * f * MULT) | 0); i++) {
      const side = rand() > 0.5 ? 1 : -1;
      addPlant(pick(dayCache), rr(1.4, 2.3), 1.0, side * rr(4.8, 12), rr(Z_NEAR, Z_FAR), rr(0.02, 0.045));
    }
    // low pink edging flowers, hugging the path edge
    for (let i = 0; i < ((84 * f * MULT) | 0); i++) {
      const side = rand() > 0.5 ? 1 : -1;
      addPlant(pinkT(pick(PINKS), i % 3), rr(0.55, 1.0), 1.5, side * rr(EDGE, 7), rr(Z_NEAR, Z_FAR), rr(0.02, 0.05));
    }

    // big foreground accents flanking the camera start
    const FG = (MOBILE ? 4 : 10) * MULT;
    for (let i = 0; i < FG; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const z = rr(Z_NEAR - 4, Z_NEAR + 6);
      const roll = rand();
      if (roll < 0.4) addPlant(pick(dayCache), rr(2.4, 3.4), 1.0, side * rr(4.8, 9), z, rr(0.02, 0.04));
      else if (roll < 0.7) addPlant(roseT(pick(["#cc2b2b", "#d6342f", "#e24b74", "#e85a86"]), i % 3), rr(2.6, 3.6), 1.2, side * rr(5, 9), z, rr(0.01, 0.025));
      else addPlant(pick(burgCache), rr(2.0, 3.0), 1.15, side * rr(5, 9), z, rr(0.012, 0.03));
    }

    /* terracotta potted plants lining the alley, evenly spaced on both sides */
    const POT_COLORS = ["#e0322f", "#e85a86", "#f4b400", "#ffffff", "#ef6f9a", "#d6342f", "#f6c41a", "#e24b74", "#f3c6d4"];
    const potCache: Record<string, THREE.Texture> = {};
    const potT = (col: string, v: number) => (potCache[col + v] ||= makePottedPlant(col));
    const POT_STEP = MOBILE ? 9 : 6;
    let pidx = 0;
    for (let z = Z_NEAR; z > Z_FAR + 8; z -= POT_STEP) {
      for (const side of [-1, 1] as const) {
        const col = pick(POT_COLORS);
        const h = rr(1.0, 1.35);
        addPlant(potT(col, pidx % 3), h, 0.7, side * (EDGE + 0.5), z + rr(-0.8, 0.8), rr(0.004, 0.012));
        pidx++;
      }
    }

    /* background treeline — soft green canopies on the horizon, clear of the path centre */
    const canopyCache: THREE.Texture[] = [makeCanopyTree(false), makeCanopyTree(false), makeCanopyTree(true)];
    const TREES = MOBILE ? 24 : 54;
    for (let tr = 0; tr < TREES; tr++) {
      const tall = rand() > 0.72;
      const ttx = tall ? canopyCache[2] : pick([canopyCache[0], canopyCache[1]]);
      const th = tall ? rr(9, 13) : rr(6.5, 9.5);
      const tw = th * (tall ? 0.78 : 0.95);
      const flank = rand() > 0.62;
      const txp = flank ? (rand() > 0.5 ? 1 : -1) * rr(20, 46) : (rand() > 0.5 ? 1 : -1) * rr(6, 54);
      const tz = flank ? rr(Z_FAR + 10, -110) : rr(Z_FAR, Z_FAR + 30);
      const tm = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), new THREE.MeshBasicMaterial({ map: ttx, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true }));
      tm.position.set(txp, GROUND_Y + th / 2 - 0.2, tz);
      tm.userData = { ph: rr(0, 6.28), sway: rr(0.005, 0.014) };
      flowers.add(tm);
    }
    // a couple of slender feature trees beside the path, mid-distance
    for (let i = 0; i < (MOBILE ? 2 : 4); i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const th = rr(8, 11),
        tw = th * 0.7;
      const tm = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), new THREE.MeshBasicMaterial({ map: canopyCache[2], transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true }));
      tm.position.set(side * rr(7, 14), GROUND_Y + th / 2, rr(-70, -150));
      tm.userData = { ph: rr(0, 6.28), sway: rr(0.006, 0.014) };
      flowers.add(tm);
    }

    /* fixed-orientation architecture: a cottage + a glasshouse set back in the
       beds, and a picket fence enclosing the garden along both outer edges.
       These live in their own group so the per-frame billboard yaw never
       touches them — buildings should read as buildings, not face the camera. */
    const structures = new THREE.Group();
    scene.add(structures);
    const sf = MOBILE ? 0.85 : 1;
    function addStructure(txt: THREE.Texture, h: number, wRatio: number, sx: number, sz: number, yaw: number) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(h * wRatio, h), new THREE.MeshBasicMaterial({ map: txt, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true }));
      m.position.set(sx, GROUND_Y + h / 2, sz);
      m.rotation.y = yaw;
      structures.add(m);
    }
    addStructure(makeHouse(), 12 * sf, 1.0, -24, -68, 0.4);
    addStructure(makeGreenhouse(), 8.8 * sf, 460 / 420, 23, -100, -0.45);

    // picket fence: one long tiled plane down each outer edge, facing inward
    const fenceTex = makeFence();
    fenceTex.wrapS = fenceTex.wrapT = THREE.RepeatWrapping;
    const fenceSpan = Z_NEAR - Z_FAR;
    fenceTex.repeat.set(fenceSpan / 3, 1);
    const fenceMat = new THREE.MeshBasicMaterial({ map: fenceTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, depthWrite: true });
    for (const side of [-1, 1] as const) {
      const fh = 1.6;
      const fence = new THREE.Mesh(new THREE.PlaneGeometry(fenceSpan, fh), fenceMat);
      fence.position.set(side * 26, GROUND_Y + fh / 2, (Z_NEAR + Z_FAR) / 2);
      fence.rotation.y = (side * Math.PI) / 2;
      structures.add(fence);
    }

    /* mondo-grass groundcover edging the path */
    const grassMat = new THREE.MeshBasicMaterial({ map: makeGrass(), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, depthWrite: true });
    const grasses = new THREE.Group();
    scene.add(grasses);
    const GN = MOBILE ? 150 : 360;
    for (let gi = 0; gi < GN; gi++) {
      const gh = rr(0.35, 0.8),
        gw = gh * 1.1;
      const gm = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), grassMat);
      const gsd = rand() > 0.5 ? 1 : -1;
      gm.position.set(gsd * rr(EDGE, 7.5), GROUND_Y + gh / 2, rr(Z_NEAR + 4, Z_FAR));
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
        const fm = fc[i];
        const yaw = Math.atan2(camera.position.x - fm.position.x, camera.position.z - fm.position.z);
        fm.rotation.set(0, yaw, REDUCE ? 0 : Math.sin(t * 0.8 + fm.userData.ph) * fm.userData.sway);
      }
      const gc = grasses.children;
      for (let j = 0; j < gc.length; j++) {
        const gr = gc[j];
        const yw = Math.atan2(camera.position.x - gr.position.x, camera.position.z - gr.position.z);
        gr.rotation.set(0, yw, REDUCE ? 0 : Math.sin(t * 1.3 + gr.userData.ph) * gr.userData.sway);
      }

      const warmth = Math.max(0, Math.min(1, (scrollP - 0.4) / 0.45));
      (scene.fog as THREE.FogExp2).color.copy(colCool).lerp(colWarm, warmth * 0.5);
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
