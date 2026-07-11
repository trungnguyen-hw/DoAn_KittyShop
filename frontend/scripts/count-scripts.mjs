import fs from "fs";

const s = fs.readFileSync("d:/Kidty Shop - Trang Chủ.html", "utf8");
const body = s.slice(s.indexOf("<body"), s.lastIndexOf("</body>"));
const scripts = [...body.matchAll(/<script[^>]*>/gi)];
console.log("script tags in body", scripts.length);
console.log(scripts.slice(0, 5).map((x) => x[0].slice(0, 120)));
