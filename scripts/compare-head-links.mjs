import fs from "fs";

function stylesheets(path) {
  const s = fs.readFileSync(path, "utf8");
  const head = s.slice(s.indexOf("<head"), s.indexOf("</head>"));
  const links = [...head.matchAll(/<link[^>]+>/gi)].map((m) => m[0]);
  return links.filter((l) => l.includes("stylesheet") || l.includes("preload") && l.includes("style"));
}

const a = stylesheets("d:/Kidty Shop - Trang Chủ.html");
const b = stylesheets("d:/Landing page – Kidty Shop.html");
console.log("Trang Chủ link tags", a.length);
console.log("Landing link tags", b.length);
const as = new Set(a);
const onlyB = b.filter((x) => !as.has(x));
const onlyA = a.filter((x) => !b.includes(x));
console.log("only in landing", onlyB.length);
console.log("only in home", onlyA.length);
if (onlyB[0]) console.log("sample only B", onlyB[0].slice(0, 200));
