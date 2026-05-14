import fs from "fs";
import crypto from "crypto";

function firstStyleHash(path) {
  const s = fs.readFileSync(path, "utf8");
  const head = s.slice(s.indexOf("<head"), s.indexOf("</head>"));
  const i = head.indexOf("<style");
  if (i < 0) return null;
  const j = head.indexOf("</style>", i);
  const chunk = head.slice(i, j + 8);
  return crypto.createHash("md5").update(chunk).digest("hex");
}

const pages = [
  "d:/Kidty Shop - Trang Chủ.html",
  "d:/Landing page – Kidty Shop.html",
  "d:/Sản Phẩm – Kidty Shop.html",
  "d:/Tất cả sản phẩm – Kidty Shop.html",
  "d:/Tin tức – Kidty Shop.html",
  "d:/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1.html",
];

for (const p of pages) {
  console.log(p.split("/").pop(), firstStyleHash(p));
}
