import fs from "fs";

function segments(file) {
  const s = fs.readFileSync(file, "utf8");
  const bi = s.indexOf("<body");
  const bj = s.lastIndexOf("</body>");
  const body = s.slice(bi, bj);
  const bodyTagEnd = body.indexOf(">") + 1;
  const h0 = body.indexOf("<header");
  const m0 = body.indexOf("<main");
  const m1 = body.lastIndexOf("</main>");
  const prelude = body.slice(bodyTagEnd, h0);
  const header = body.slice(h0, m0);
  const mainClose = m1 + 7;
  const post = body.slice(mainClose);
  return { preludeLen: prelude.length, headerLen: header.length, postLen: post.length };
}

console.log("trangchu", segments("d:/Kidty Shop - Trang Chủ.html"));
console.log("dam1", segments("d:/Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1.html"));
