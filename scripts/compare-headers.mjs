import fs from "fs";
import crypto from "crypto";

function getHeaderSlice(file) {
  const s = fs.readFileSync(file, "utf8");
  const body = s.slice(s.indexOf("<body"), s.lastIndexOf("</body>"));
  return body.slice(body.indexOf("<header"), body.indexOf("<main"));
}

const a = crypto.createHash("md5").update(getHeaderSlice("d:/Kidty Shop - Trang Chủ.html")).digest("hex");
const b = crypto.createHash("md5").update(getHeaderSlice("d:/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1.html")).digest("hex");
console.log("trang chu header", a);
console.log("dam header", b, a === b);
