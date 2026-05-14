import fs from "fs";

const s = fs.readFileSync("d:/Kidty Shop - Header.html", "utf8");
const body = s.slice(s.indexOf("<body"), s.lastIndexOf("</body>"));
const re = /class="[^"]*cart[^"]*"/gi;
let m;
let n = 0;
while ((m = re.exec(body)) && n++ < 20) {
  console.log(m[0]);
}
