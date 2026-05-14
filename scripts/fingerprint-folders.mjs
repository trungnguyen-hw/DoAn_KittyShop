import fs from "fs";
import crypto from "crypto";

function folderFingerprint(folderPath) {
  const names = fs.readdirSync(folderPath).sort();
  const h = crypto.createHash("md5");
  for (const n of names) {
    const p = `${folderPath}/${n}`;
    const st = fs.statSync(p);
    h.update(n);
    if (st.isFile()) {
      h.update(fs.readFileSync(p));
    }
  }
  return h.digest("hex");
}

const dir = "d:/";
const folders = fs
  .readdirSync(dir)
  .filter((n) => n.endsWith("_files") && n.includes("Kidty"));

const map = new Map();
for (const f of folders) {
  const fp = `${dir}${f}`;
  const id = folderFingerprint(fp);
  if (!map.has(id)) map.set(id, []);
  map.get(id).push(f);
}
console.log("unique folder fingerprints", map.size);
for (const [id, names] of map) {
  console.log(id.slice(0, 12) + "...", names.length);
  if (names.length < folders.length) console.log("  example", names[0]);
}
