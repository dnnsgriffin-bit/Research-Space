/**
 * Product film, captions: writes film.srt (for YouTube), film.vtt (for the site) and
 * chapters.txt from the same timeline the picture and the soundtrack use.
 *
 *   OUT=/path/to/work node tools/film/captions.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const OUT = process.env.OUT;
if (!OUT) throw new Error("Set OUT to the work folder used by capture.cjs");
const tl = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
const INTRO = 10.9; // matches film.html
const END = INTRO + tl.total / tl.fps;
const lines = tl.events.filter((e) => e.type === "line");

const cues = [
  [0.3, 4.4, "[Soft music]\nTraining was completed. Did work change?"],
  [4.7, 6.9, "Completion and satisfaction light only the first link of the evidence chain."],
  [6.9, 8.7, "Leaders are asking about transfer, performance and the business outcome."],
  [8.9, 10.8, "Evidence Studio. A two-minute evidence check for learning teams. A prototype."],
];
lines.forEach((l, i) => {
  const start = INTRO + l.t / 1000 + 0.15;
  const end = (i + 1 < lines.length ? INTRO + lines[i + 1].t / 1000 : END) - 0.05;
  const text = `Step ${l.n} of ${lines.length}. ${l.text}${l.sub ? "\n" + l.sub : ""}`;
  // Long steps get the example reminder as a second cue, so no single cue lingers.
  if (end - start > 9) {
    cues.push([start, start + 6, text]);
    cues.push([start + 6, end, "All inputs shown are examples. Illustrative, not real data."]);
  } else cues.push([start, end, text]);
});
cues.push([END + 0.5, END + 3.0, "Know what you can claim before someone asks."]);
cues.push([END + 3.0, END + 6.9, "Evidence Studio. Free while it’s a prototype. DennisRGriffin.com"]);

const stamp = (s, sep) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}${sep}${p(ms % 1000, 3)}`;
};
fs.writeFileSync(
  path.join(OUT, "film.srt"),
  cues.map(([a, b, t], i) => `${i + 1}\n${stamp(a, ",")} --> ${stamp(b, ",")}\n${t}\n`).join("\n"),
);
fs.writeFileSync(
  path.join(OUT, "film.vtt"),
  "WEBVTT\n\n" + cues.map(([a, b, t]) => `${stamp(a, ".")} --> ${stamp(b, ".")}\n${t}\n`).join("\n"),
);
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
fs.writeFileSync(
  path.join(OUT, "chapters.txt"),
  ["0:00 Training was completed. Did work change?"]
    .concat(lines.map((l) => `${mmss(INTRO + l.t / 1000)} ${l.text.replace(/\.$/, "")}`))
    .concat([`${mmss(END + 0.5)} Know what you can claim`])
    .join("\n") + "\n",
);
console.log(`${cues.length} cues, film length ${(END + 7.2).toFixed(1)} s`);
