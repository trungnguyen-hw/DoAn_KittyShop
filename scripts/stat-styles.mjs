import fs from "fs";

const dirs = [
  "d:/Kidty Shop - Trang Chủ_files/styles.css",
  "d:/Landing page – Kidty Shop_files/styles.css",
  "d:/Sản Phẩm – Kidty Shop_files/styles.css",
];

for (const p of dirs) {
  try {
    const st = fs.statSync(p);
    console.log(p.split("/").pop(), st.size);
  } catch (e) {
    console.log("missing", p);
  }
}
