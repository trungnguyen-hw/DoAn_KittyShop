import fs from "fs";

const a = fs.readFileSync("d:/Kidty Shop - Trang Chủ.html", "utf8");
const b = fs.readFileSync("d:/Landing page – Kidty Shop.html", "utf8");
const innerA = a.slice(a.indexOf("<head") + 6, a.indexOf("</head>"));
const innerB = b.slice(b.indexOf("<head") + 6, b.indexOf("</head>"));
console.log("A in B?", b.includes(innerA));
console.log("B in A?", a.includes(innerB));
