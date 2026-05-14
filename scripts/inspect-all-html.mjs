import fs from "fs";

const dir = "d:/";
const htmls = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".html") && f.includes("Kidty"));

for (const name of htmls.sort()) {
  const p = dir + name;
  const s = fs.readFileSync(p, "utf8");
  const bi = s.indexOf("<body");
  const bj = s.lastIndexOf("</body>");
  const body = s.slice(bi, bj);
  const h = body.indexOf("<header");
  const m = body.indexOf("<main");
  const f = body.indexOf("<footer");
  console.log(name, "body", body.length, "h,m,f", h, m, f);
}
