/**
 * Product film, pass 1: drive the real Evidence Check and capture it frame by frame.
 *
 * Time is fully controlled, so the footage is identical on every run:
 *  - timers and requestAnimationFrame run on Playwright's fake clock;
 *  - every CSS transition and animation is paused and stepped by exactly one video frame.
 *
 * Output: numbered JPEG frames plus timeline.json (cursor path, clicks, camera targets
 * and on-screen lines) for pass 2 (render.cjs).
 *
 *   OUT=/path/to/work URL=http://localhost:4173/ node tools/film/capture.cjs
 * Optional: FPS (default 60), DSF (default 3, i.e. 3840x2880 frames).
 */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const FPS = Number(process.env.FPS || 60);
const DSF = Number(process.env.DSF || 3);
const OUT = process.env.OUT;
const URL = process.env.URL || "http://localhost:4173/";
if (!OUT) throw new Error("Set OUT to a work folder");
const W = 1280;
const H = 960;
const DT = 1000 / FPS;

(async () => {
  const framesDir = path.join(OUT, "footage");
  fs.mkdirSync(framesDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: DSF,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.clock.install({ time: new Date("2026-11-12T10:00:00") });
  await page.goto(URL);
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.fonts.ready);
  // The preview uses in-memory routing: open the tool through its own link.
  await page.evaluate(() =>
    [...document.querySelectorAll('a[href="/check"]')].find((a) => a.offsetParent).click(),
  );
  await page.waitForTimeout(1200);
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important} *{cursor:none!important}" });
  // The film draws its own sparks, so the product's are switched off for the capture.
  await page.evaluate(() => (document.documentElement.dataset.film = "1"));
  await page.clock.pauseAt(new Date("2026-11-12T10:05:00"));
  await page.evaluate(() => {
    const seen = new WeakMap();
    window.__advance = (dt) => {
      for (const a of document.getAnimations()) {
        let t = seen.get(a);
        if (t === undefined) {
          t = 0;
          try {
            a.pause();
          } catch {}
        }
        t += dt;
        seen.set(a, t);
        try {
          a.currentTime = t;
        } catch {}
      }
    };
  });
  const cdp = await ctx.newCDPSession(page);

  const tl = { fps: FPS, w: W, h: H, frames: [], events: [] };
  let frame = 0;
  let acc = 0;
  const cur = { x: 980, y: 520, down: false };
  const now = () => (frame * 1000) / FPS;
  const ev = (type, data = {}) => tl.events.push({ t: now(), type, ...data });

  async function step(n = 1) {
    for (let i = 0; i < n; i++) {
      acc += DT;
      const whole = Math.floor(acc);
      acc -= whole;
      await page.clock.runFor(whole);
      // Advance the animations and note where the chain is, so the film can keep it in view.
      const { chain, sx, sy } = await page.evaluate((dt) => {
        window.__advance(dt);
        const r = document.querySelector(".ec-chain")?.getBoundingClientRect();
        return {
          chain: r ? [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 10) / 10) : null,
          sx: window.scrollX,
          sy: window.scrollY,
        };
      }, DT);
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 93,
        // Without an explicit clip and scale, the capture comes back at 1x. The clip is in
        // page coordinates, so it has to follow the scroll position.
        clip: { x: sx, y: sy, width: W, height: H, scale: DSF },
      });
      fs.writeFileSync(
        path.join(framesDir, `f${String(frame).padStart(5, "0")}.jpg`),
        Buffer.from(data, "base64"),
      );
      tl.frames.push({ x: +cur.x.toFixed(1), y: +cur.y.toFixed(1), d: cur.down ? 1 : 0, c: chain });
      frame++;
    }
  }
  const wait = (ms) => step(Math.round(ms / DT));

  /** Bounding box of a locator, or the union of several, in viewport pixels. */
  async function box(target) {
    if (target && typeof target.x === "number") return target;
    const list = Array.isArray(target) ? target : [target];
    let u = null;
    for (const t of list) {
      const loc = typeof t === "string" ? page.locator(t).first() : t;
      const b = await loc.boundingBox();
      if (!b) throw new Error(`No box for ${t}`);
      u = u
        ? {
            x: Math.min(u.x, b.x),
            y: Math.min(u.y, b.y),
            r: Math.max(u.r, b.x + b.width),
            b: Math.max(u.b, b.y + b.height),
          }
        : { x: b.x, y: b.y, r: b.x + b.width, b: b.y + b.height };
    }
    return { x: u.x, y: u.y, width: u.r - u.x, height: u.b - u.y };
  }

  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  /** Glide the cursor to a target along a slight arc. `at` picks a point inside the box (0..1). */
  async function move(target, ms = 700, at = [0.5, 0.5]) {
    const b = await box(target);
    const to = { x: b.x + b.width * at[0], y: b.y + b.height * at[1] };
    const from = { x: cur.x, y: cur.y };
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const n = Math.max(2, Math.round(ms / DT));
    const bend = Math.min(26, dist * 0.08);
    const nx = dist ? -(to.y - from.y) / dist : 0;
    const ny = dist ? (to.x - from.x) / dist : 0;
    for (let i = 1; i <= n; i++) {
      const u = ease(i / n);
      const arc = Math.sin(Math.PI * u) * bend;
      cur.x = from.x + (to.x - from.x) * u + nx * arc;
      cur.y = from.y + (to.y - from.y) * u + ny * arc;
      await page.mouse.move(cur.x, cur.y);
      await step();
    }
  }

  async function click(holdMs = 90) {
    ev("click", { x: cur.x, y: cur.y });
    cur.down = true;
    await page.mouse.down();
    await wait(holdMs);
    await page.mouse.up();
    cur.down = false;
    await step();
  }

  async function scrollTo(y, ms = 900) {
    const from = await page.evaluate(() => window.scrollY);
    const n = Math.max(2, Math.round(ms / DT));
    for (let i = 1; i <= n; i++) {
      const u = ease(i / n);
      await page.evaluate((v) => window.scrollTo(0, v), from + (y - from) * u);
      await page.mouse.move(cur.x, cur.y);
      await step();
    }
  }
  /** Scroll so the target's top sits `top` pixels below the viewport top. */
  async function scrollToEl(target, top, ms = 900) {
    const b = await box(target);
    const y = await page.evaluate(() => window.scrollY);
    await scrollTo(Math.max(0, y + b.y - top), ms);
  }

  async function type(text, perChar = 110) {
    for (const ch of text) {
      await page.keyboard.type(ch);
      await wait(perChar);
    }
  }

  /**
   * Point the camera. The view is the target box plus padding; pass 2 fits it inside the
   * pane. (The chain strip needs no camera: its position is recorded on every frame.)
   */
  async function cam(pane, target, { pad = 24, ms = 900, dx = 0, dy = 0 } = {}) {
    const b = await box(target);
    ev("cam", {
      pane,
      ms,
      x: b.x - pad + dx,
      y: b.y - pad + dy,
      w: b.width + pad * 2,
      h: b.height + pad * 2,
    });
  }
  const line = (n, text, sub = "") => ev("line", { n, text, sub });
  /** A click just changed chain link `i`: the film draws a spark from the cursor to that link. */
  const ignite = (i, tone = "lamp") => ev("ignite", { i, tone, x: cur.x, y: cur.y });
  /** Ask the film to draw a frame around something for `ms` milliseconds. */
  async function focus(target, ms = 2400, pad = 8) {
    const b = await box(target);
    ev("focus", { ms, x: b.x - pad, y: b.y - pad, w: b.width + pad * 2, h: b.height + pad * 2 });
  }
  const hud = (on) => ev("hud", { on });

  // The film's main pane is about 2:1; these are the matching views of the page.
  const PANE = 1680 / 838;
  const CLOSE = 1680 / (838 - 270 - 16); // pane shape while the chain strip is showing
  const FULL = { x: 0, y: 0, width: W, height: W / PANE };
  const chip = (name) => page.locator(".ec-chip", { hasText: name }).first();
  const preset = (name) => page.locator(".ec-preset", { hasText: name }).first();
  const node = (i) => page.locator(".ec-node").nth(i);

  /* ------------------------------ Choreography ------------------------------ */

  // The left column of the workbench, used for close-ups of whatever is being clicked.
  const leftCol = await box(".ec-bench-presets");
  /** A close-up band across the left column, `h` pixels tall, centered on the target. */
  const closeUp = async (target, dy = 0) => {
    const b = await box(target);
    const w = leftCol.width - 8;
    const h = w / CLOSE;
    return { x: leftCol.x + 4, y: b.y + b.height / 2 - h / 2 + dy, width: w, height: h };
  };

  // 1. Establish: the whole tool, then pick the most common starting point.
  await cam("main", FULL, { pad: 0, ms: 0 });
  hud(false);
  await page.mouse.move(cur.x, cur.y);
  await wait(400);
  line(1, "Start from the report you already have.");
  await wait(1100);
  await scrollToEl(".ec-bench", 84, 1100);
  await cam("main", [".ec-bench-presets", ".ec-stage"], { pad: 14, ms: 1000 });
  await move(preset("Completion + satisfaction survey"), 900);
  await wait(250);
  await click();
  await wait(1700);

  // 2. Tick measures in close-up; the chain stays in view as a strip above.
  line(2, "Tick what you actually measured.", "The chain lights only where something was observed.");
  await scrollToEl(".ec-bench-measures", 96, 1000);
  hud(true);
  await cam("main", await closeUp(chip("Knowledge"), 16), { pad: 0, ms: 900 });
  await wait(500);
  await move(chip("Knowledge"), 800, [0.3, 0.55]);
  await wait(220);
  ignite(2);
  await click();
  await wait(1500);
  await cam("main", await closeUp(chip("Behavior"), -16), { pad: 0, ms: 800 });
  await move(chip("Behavior"), 750, [0.3, 0.55]);
  await wait(220);
  ignite(4);
  await click();
  await wait(1900);

  // 3. How far the claim reaches, then open the unknown link.
  line(3, "See how far an honest claim can reach.", "Open any link to see what it can’t prove yet.");
  hud(false);
  await cam("main", ".ec-stage", { pad: 16, ms: 1100 });
  await wait(1000);
  await focus(".ec-reach", 1900, 6);
  await wait(900);
  await move(node(3), 900, [0.5, 0.3]);
  await wait(220);
  await click();
  await wait(800);
  {
    // Frame the inspector at the width of the right column, then drift down through it.
    const st = await box(".ec-stage");
    const ins = await box("#ec-inspector");
    const w = st.width + 12;
    const h = w / PANE;
    await cam("main", { x: st.x - 6, y: ins.y - 8, width: w, height: h }, { pad: 0, ms: 1100 });
    await wait(2300);
    const down = Math.max(0, Math.min(ins.height + 16 - h, H - (ins.y - 8) - h));
    await cam("main", { x: st.x - 6, y: ins.y - 8 + down, width: w, height: h }, { pad: 0, ms: 1500 });
    await wait(2500);
  }

  // 4. Add numbers.
  line(4, "Have the numbers? Add them.", "The brief says what they can and can’t show.");
  await scrollToEl(".ec-values", 330, 900);
  await cam("main", await closeUp(".ec-values > summary"), { pad: 0, ms: 900 });
  hud(true);
  await move(".ec-values > summary", 800, [0.3, 0.5]);
  await wait(220);
  await click();
  await wait(500);
  const row = page.locator(".ec-vrow", { hasText: "Knowledge" });
  await scrollToEl(row, 300, 800);
  await cam("main", await closeUp(row.locator("input").nth(0), -22), { pad: 0, ms: 800 });
  await move(row.locator("input").nth(0), 700, [0.3, 0.5]);
  await click();
  await type("78");
  await wait(300);
  await move(row.locator("input").nth(1), 500, [0.3, 0.5]);
  await click();
  await type("64");
  await wait(1300);

  // 5. Work conditions: a "No" marks a reported barrier on the chain.
  line(5, "Check the workplace.", "A “No” marks a barrier to verify before you blame the training.");
  const manager = page.locator(".ec-cond", { hasText: "Did managers expect" });
  await scrollToEl(manager, 330, 1200);
  await cam("main", await closeUp(manager, 2), { pad: 0, ms: 1000 });
  await wait(500);
  const no = manager.locator('button[data-v="no"]');
  await move(no, 900);
  await wait(220);
  ignite(4, "flag");
  await click();
  await wait(2500);

  // 6. The brief: the camera holds one framing while the page scrolls through it.
  line(6, "Leave with a brief your leaders can act on.", "Your numbers quoted back, with their limits.");
  hud(false);
  const PAGE = { x: 32, y: 84, width: 1216, height: 606 };
  await cam("main", FULL, { pad: 0, ms: 1000 });
  await scrollToEl(".ec-brief", 100, 1500);
  await cam("main", PAGE, { pad: 0, ms: 1100 });
  await wait(2300);
  await scrollToEl(".ec-bgrid", 112, 1500);
  await wait(1300);
  {
    const r = await box(".ec-results");
    await cam("main", { x: 36, y: r.y - 150, width: 780, height: 780 / PANE }, { pad: 0, ms: 1200 });
    await move(".ec-results li", 1000, [0.5, 0.75]);
    await focus(".ec-results", 2500, 6);
    await wait(2600);
  }
  const copy = page.getByRole("button", { name: /Copy brief|Copied/ });
  await cam("main", PAGE, { pad: 0, ms: 1200 });
  await scrollToEl(copy, 590, 1400);
  await move(copy, 900);
  await wait(220);
  await click();
  await wait(2300);
  ev("end");

  tl.total = frame;
  tl.errors = errors;
  fs.writeFileSync(path.join(OUT, "timeline.json"), JSON.stringify(tl));
  console.log(`frames ${frame} (${(frame / FPS).toFixed(1)} s), page errors: ${errors.length}`);
  await browser.close();
})();
