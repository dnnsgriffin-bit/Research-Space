/**
 * Product film, pass 2: composite the captured footage with title cards, camera moves,
 * the cursor and the on-screen lines, one frame at a time, then encode with ffmpeg.
 *
 *   OUT=/path/to/work node tools/film/render.cjs
 * Optional: WORKERS (default 3), FRAMES="a-b" to render a range, STILLS="t1,t2" (seconds)
 * to save single frames for review instead of a video, AUDIO=/path/to.wav to add sound.
 */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawnSync } = require("node:child_process");

const OUT = process.env.OUT;
if (!OUT) throw new Error("Set OUT to the work folder used by capture.cjs");
const WORKERS = Number(process.env.WORKERS || 3);
const TYPES = { ".html": "text/html", ".json": "application/json", ".jpg": "image/jpeg" };

(async () => {
  const tl = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = url.startsWith("/work/")
      ? path.join(OUT, url.slice(6))
      : path.join(__dirname, url === "/" ? "film.html" : url);
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end();
      res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;

  const browser = await chromium.launch();
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    page.on("pageerror", (e) => console.error("page error:", String(e)));
    await page.goto(base + "/");
    const info = await page.evaluate(([t, s]) => window.setup(t, s), [tl, "/work/footage"]);
    return { page, info };
  };

  if (process.env.STILLS) {
    const { page } = await open();
    const dir = path.join(OUT, "stills");
    fs.mkdirSync(dir, { recursive: true });
    for (const s of process.env.STILLS.split(",")) {
      const f = Math.round(Number(s) * tl.fps);
      await page.evaluate((n) => window.render(n), f);
      await page.screenshot({ path: path.join(dir, `t${String(s).padStart(5, "0")}.jpg`), quality: 90 });
    }
    await browser.close();
    server.close();
    return;
  }

  const dir = path.join(OUT, "final");
  fs.mkdirSync(dir, { recursive: true });
  const first = await open();
  let [from, to] = [0, first.info.total];
  if (process.env.FRAMES) [from, to] = process.env.FRAMES.split("-").map(Number);
  const pages = [first.page];
  for (let i = 1; i < WORKERS; i++) pages.push((await open()).page);
  const per = Math.ceil((to - from) / WORKERS);
  const t0 = Date.now();
  // Each worker takes one contiguous block, so its footage frames load in order.
  await Promise.all(
    pages.map(async (page, w) => {
      const a = from + w * per;
      const b = Math.min(to, a + per);
      for (let f = a; f < b; f++) {
        await page.evaluate((n) => window.render(n), f);
        await page.screenshot({
          path: path.join(dir, `o${String(f).padStart(5, "0")}.jpg`),
          quality: 96,
        });
      }
    }),
  );
  console.log(`rendered ${to - from} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  await browser.close();
  server.close();

  if (!process.env.FRAMES) {
    const audio = process.env.AUDIO;
    const args = ["-y", "-loglevel", "error", "-framerate", String(tl.fps), "-i", path.join(dir, "o%05d.jpg")];
    if (audio) args.push("-i", audio);
    args.push(
      "-c:v", "libx264", "-preset", "slow", "-crf", process.env.CRF || "17",
      "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
      "-movflags", "+faststart",
    );
    if (audio) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
    args.push(path.join(OUT, process.env.NAME || "film.mp4"));
    const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
    console.log("ffmpeg exit", r.status);
  }
})();
