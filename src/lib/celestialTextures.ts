export type CelestialKind =
  | "earth"
  | "moon"
  | "sun"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "neptune";

export const celestialTexturePaths: Record<CelestialKind, string> = {
  earth: "/textures/earth_daymap.jpg",
  moon: "/textures/moon.jpg",
  sun: "/textures/sun.jpg",
  mercury: "/textures/mercury.jpg",
  venus: "/textures/venus_atmosphere.jpg",
  mars: "/textures/mars.jpg",
  jupiter: "/textures/jupiter.jpg",
  neptune: "/textures/neptune.jpg",
};

function randomSource(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function drawEarth(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "#174d8a";
  ctx.fillRect(0, 0, width, height);
  const continents: Array<Array<[number, number]>> = [
    [[.06,.20],[.13,.12],[.20,.14],[.23,.20],[.29,.22],[.31,.30],[.27,.35],[.25,.43],[.19,.42],[.17,.52],[.13,.48],[.12,.36],[.08,.33]],
    [[.22,.49],[.29,.45],[.33,.52],[.34,.63],[.31,.73],[.27,.84],[.24,.78],[.23,.65],[.20,.57]],
    [[.47,.23],[.52,.16],[.58,.18],[.62,.12],[.68,.18],[.73,.16],[.82,.20],[.88,.27],[.84,.34],[.78,.31],[.74,.39],[.67,.35],[.63,.43],[.58,.39],[.53,.33],[.49,.36]],
    [[.51,.42],[.60,.39],[.64,.48],[.62,.60],[.57,.74],[.53,.71],[.49,.56]],
    [[.78,.62],[.83,.57],[.89,.63],[.91,.70],[.86,.75],[.80,.70]],
    [[.01,.85],[.18,.87],[.36,.84],[.53,.87],[.72,.83],[.92,.85],[1,.88],[1,1],[0,1]],
  ];
  ctx.fillStyle = "#55834e";
  for (const points of continents) {
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x * width, y * height) : ctx.moveTo(x * width, y * height));
    ctx.closePath();
    ctx.fill();
  }
  const random = randomSource(41);
  for (let i = 0; i < 1800; i++) {
    const x = random() * width;
    const y = random() * height;
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    ctx.fillStyle = pixel[1] > pixel[2] ? `rgba(176,151,89,${random() * .32})` : `rgba(67,157,207,${random() * .24})`;
    ctx.fillRect(x, y, 1 + random() * 8, 1 + random() * 3);
  }
  ctx.strokeStyle = "rgba(248,250,255,.36)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 22; i++) {
    const x = random() * width;
    const y = random() * height;
    ctx.beginPath();
    ctx.ellipse(x, y, 10 + random() * 45, 2 + random() * 5, -.2 + random() * .4, 0, Math.PI * 1.7);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(245,249,255,.75)";
  ctx.fillRect(0, 0, width, height * .035);
  ctx.fillRect(0, height * .96, width, height * .04);
}

function drawRock(ctx: CanvasRenderingContext2D, width: number, height: number, kind: "moon" | "mercury" | "mars") {
  const base = kind === "mars" ? "#994733" : kind === "moon" ? "#99999b" : "#777a80";
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  const random = randomSource(kind === "mars" ? 67 : kind === "moon" ? 19 : 31);
  for (let i = 0; i < 3300; i++) {
    const x = random() * width;
    const y = random() * height;
    const r = 1 + random() * 13;
    ctx.fillStyle = kind === "mars"
      ? `rgba(${random() > .5 ? "215,139,89" : "70,37,35"},${random() * .25})`
      : `rgba(${random() > .5 ? "236,236,229" : "45,48,55"},${random() * .21})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.8, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < (kind === "moon" ? 115 : 65); i++) {
    const x = random() * width;
    const y = random() * height;
    const r = 2 + random() * (kind === "mars" ? 10 : 15);
    ctx.strokeStyle = "rgba(240,238,228,.3)";
    ctx.lineWidth = 1 + random() * 2;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * .75, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (kind === "mars") {
    ctx.fillStyle = "rgba(245,230,208,.65)";
    ctx.fillRect(0, 0, width, height * .035);
    ctx.fillRect(0, height * .96, width, height * .04);
  }
}

function drawGas(ctx: CanvasRenderingContext2D, width: number, height: number, kind: "sun" | "venus" | "jupiter" | "neptune") {
  const colors: Record<typeof kind, string[]> = {
    sun: ["#ffcf46", "#f49e31", "#ffe778", "#f6b830"],
    venus: ["#cbaa74", "#e4cf9c", "#b9976e", "#f2dcb5"],
    jupiter: ["#d6aa7f", "#a77558", "#ead3a9", "#bd8765", "#f2d9bd"],
    neptune: ["#244da7", "#4675d5", "#1d3e95", "#7197e6"],
  };
  const random = randomSource(kind === "jupiter" ? 73 : 11);
  let y = 0;
  while (y < height) {
    const band = 5 + random() * (kind === "jupiter" ? 24 : 34);
    ctx.fillStyle = colors[kind][Math.floor(random() * colors[kind].length)];
    ctx.fillRect(0, y, width, band + 2);
    y += band;
  }
  for (let i = 0; i < 190; i++) {
    const x = random() * width;
    const yy = random() * height;
    ctx.strokeStyle = `rgba(255,255,255,${random() * .14})`;
    ctx.lineWidth = 1 + random() * 3;
    ctx.beginPath();
    ctx.ellipse(x, yy, 18 + random() * 80, 1 + random() * 4, 0, 0, Math.PI * 1.5);
    ctx.stroke();
  }
  if (kind === "jupiter") {
    ctx.fillStyle = "#af644d";
    ctx.beginPath();
    ctx.ellipse(width * .61, height * .62, 59, 20, -.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f1cfab";
    ctx.lineWidth = 5;
    ctx.stroke();
  }
}

export function makeCelestialCanvas(kind: CelestialKind) {
  const canvas = document.createElement("canvas");
  canvas.width = kind === "moon" ? 512 : 1024;
  canvas.height = kind === "moon" ? 256 : 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  if (kind === "earth") drawEarth(ctx, canvas.width, canvas.height);
  else if (kind === "moon" || kind === "mercury" || kind === "mars") drawRock(ctx, canvas.width, canvas.height, kind);
  else drawGas(ctx, canvas.width, canvas.height, kind);
  return canvas;
}
