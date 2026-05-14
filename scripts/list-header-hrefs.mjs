import fs from "fs";

const s = fs.readFileSync("d:/Kidty Shop - Header.html", "utf8");
const body = s.slice(s.indexOf("<body"), s.lastIndexOf("</body>"));
const header = body.slice(body.indexOf("<header"), body.indexOf("<main"));
const hrefs = [...header.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const uniq = [...new Set(hrefs)].filter((h) => h.includes("kidty") || h.startsWith("/"));
console.log(uniq.slice(0, 40).join("\n"));
console.log("--- total uniq", uniq.length);
