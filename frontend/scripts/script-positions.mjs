import fs from "fs";

const s = fs.readFileSync("d:/Kidty Shop - Trang Chủ.html", "utf8");
const body = s.slice(s.indexOf("<body"), s.lastIndexOf("</body>"));
let pos = 0;
let n = 0;
while (n < 15) {
  const i = body.indexOf("<script", pos);
  if (i < 0) break;
  console.log(n, i, body.slice(i, i + 90).replace(/\n/g, " "));
  pos = i + 7;
  n++;
}
