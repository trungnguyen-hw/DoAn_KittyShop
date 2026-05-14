import fs from "fs";

const dir = "d:/";
const htmls = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".html") && f.includes("Kidty"));

for (const name of htmls.sort()) {
  const s = fs.readFileSync(dir + name, "utf8");
  const m = s.match(/<body([^>]*)>/);
  console.log(name, m ? m[1].slice(0, 120) : "no body");
}
