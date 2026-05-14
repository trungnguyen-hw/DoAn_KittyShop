import fs from "fs";
import crypto from "crypto";

const dir = "d:/";
const folders = fs
  .readdirSync(dir)
  .filter((n) => n.endsWith("_files") && n.includes("Kidty"));

const hashes = new Map();
for (const f of folders) {
  const p = `${dir}${f}/styles.css`;
  if (!fs.existsSync(p)) {
    console.log("no styles", f);
    continue;
  }
  const h = crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");
  if (!hashes.has(h)) hashes.set(h, []);
  hashes.get(h).push(f);
}
console.log("unique hashes", hashes.size);
for (const [h, names] of hashes) {
  console.log(h, names.length, names[0]);
}
