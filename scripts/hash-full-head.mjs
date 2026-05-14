import fs from "fs";
import crypto from "crypto";

for (const p of [
  "d:/Kidty Shop - Trang Chủ.html",
  "d:/Landing page – Kidty Shop.html",
]) {
  const s = fs.readFileSync(p, "utf8");
  const inner = s.slice(s.indexOf("<head") + 6, s.indexOf("</head>"));
  console.log(p.split("/").pop(), inner.length, crypto.createHash("md5").update(inner).digest("hex"));
}
