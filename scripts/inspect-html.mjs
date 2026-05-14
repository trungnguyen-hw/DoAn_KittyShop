import fs from "fs";

const p = process.argv[2] || "d:/Kidty Shop - Header.html";
const s = fs.readFileSync(p, "utf8");
const bi = s.indexOf("<body");
const bj = s.lastIndexOf("</body>");
const body = s.slice(bi, bj);
const tags = [
  "<header",
  "<footer",
  "<main",
  'id="wrapper"',
  'class="wrapper"',
  "site-header",
  "main-content",
  "wraphead",
  "topbar",
];
for (const tag of tags) {
  console.log(tag, body.indexOf(tag));
}
