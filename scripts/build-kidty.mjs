import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");
const SOURCE_DRIVE = "d:/";

const PAGE_SOURCES = [
  { id: "trang-chu", file: "Kidty Shop - Trang Chủ.html", bodyClass: "index" },
  { id: "landing", file: "Landing page – Kidty Shop.html", bodyClass: "page" },
  { id: "san-pham", file: "Sản Phẩm – Kidty Shop.html", bodyClass: "collection" },
  {
    id: "tat-ca",
    file: "Tất cả sản phẩm – Kidty Shop.html",
    bodyClass: "collection",
    paginate: true,
  },
  { id: "tin-tuc", file: "Tin tức – Kidty Shop.html", bodyClass: "blog" },
  {
    id: "dam-style-1",
    file: "Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiển thị 1.html",
    bodyClass: "product",
  },
  {
    id: "dam-style-2",
    file: "Đầm Hoa Công Chúa FM-45 – Kidty Shop - KIểu hiện thị 2.html",
    bodyClass: "product",
  },
  {
    id: "dam-style-3",
    file: "Đầm Hoa Công Chúa FM-45 – Kidty Shop - Kiểu hiện thị 3.html",
    bodyClass: "product",
  },
];

function fixAssetPaths(html) {
  return html.replace(/\.\/([^"']+?_files)\//g, "/$1/");
}

function readSourceHtml(fileName) {
  const p = path.join(SOURCE_DRIVE, fileName);
  return fs.readFileSync(p, "utf8");
}

function extractHeadInner(html) {
  const a = html.indexOf("<head");
  const b = html.indexOf("</head>");
  return html.slice(a + 6, b);
}

function extractHtmlOpenTag(html) {
  const m = html.match(/<html([^>]*)>/i);
  return m ? m[1].trim() : "";
}

function extractBodyClass(html) {
  const m = html.match(/<body([^>]*)>/i);
  if (!m) return "";
  const cm = m[1].match(/class="([^"]*)"/);
  return cm ? cm[1] : "";
}

function extractBodyParts(html) {
  const bi = html.indexOf("<body");
  const bj = html.lastIndexOf("</body>");
  const body = html.slice(bi, bj);
  const bodyTagEnd = body.indexOf(">") + 1;
  const h0 = body.indexOf("<header");
  const m0 = body.indexOf("<main");
  const m1 = body.lastIndexOf("</main>");
  if (h0 < 0 || m0 < 0 || m1 < 0) throw new Error("Missing header/main in body");
  const prelude = body.slice(bodyTagEnd, h0);
  const header = body.slice(h0, m0);
  const mainOpenEnd = body.indexOf(">", m0) + 1;
  const mainOpenTag = body.slice(m0, mainOpenEnd);
  const mainInner = body.slice(mainOpenEnd, m1);
  const post = body.slice(m1 + 7);
  return { prelude, header, mainOpenTag, mainInner, post };
}

function stripScripts(html) {
  const scripts = [];
  let out = "";
  let i = 0;
  while (i < html.length) {
    const s = html.toLowerCase().indexOf("<script", i);
    if (s === -1) {
      out += html.slice(i);
      break;
    }
    out += html.slice(i, s);
    const s2 = html.indexOf(">", s);
    if (s2 < 0) {
      out += html.slice(s);
      break;
    }
    const openTag = html.slice(s, s2 + 1);
    const srcM = openTag.match(/\ssrc="([^"]*)"/i);
    const end = html.indexOf("</script>", s2);
    if (end < 0) {
      out += html.slice(s);
      break;
    }
    const inner = html.slice(s2 + 1, end);
    if (srcM) {
      scripts.push({ kind: "external", src: fixAssetPaths(srcM[1]) });
    } else {
      scripts.push({ kind: "inline", code: inner });
    }
    i = end + "</script>".length;
  }
  return { html: out, scripts };
}

function mainPropsFromOpenTag(openTag) {
  const props = {};
  const classM = openTag.match(/class="([^"]*)"/);
  if (classM) props.className = classM[1];
  const idM = openTag.match(/id="([^"]*)"/);
  if (idM) props.id = idM[1];
  return props;
}

function splitTatCaMainInner(mainInner) {
  const marker =
    '<div class="content-product-list product-list filter clearfix">';
  const sortBar = '<div class="sortpagibar pagi clearfix text-center">';
  const i0 = mainInner.indexOf(marker);
  const i1 = mainInner.indexOf(sortBar);
  if (i0 < 0 || i1 < 0 || i1 <= i0) {
    throw new Error("Could not split tat-ca main inner for pagination demo");
  }
  const before = mainInner.slice(0, i0);
  const listInner = mainInner.slice(i0 + marker.length, i1);
  const after = mainInner.slice(i1);
  return { before, listInner, after };
}

function copyDirRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const fp = path.join(from, name);
    const tp = path.join(to, name);
    if (fs.statSync(fp).isDirectory()) copyDirRecursive(fp, tp);
    else fs.copyFileSync(fp, tp);
  }
}

function copyAssetFolders() {
  const dest = path.join(REPO, "public");
  const folders = new Set(
    PAGE_SOURCES.map((p) => p.file.replace(/\.html$/i, "_files")),
  );
  for (const name of folders) {
    const from = path.join(SOURCE_DRIVE, name);
    if (!fs.existsSync(from)) {
      console.warn("missing asset folder:", name);
      continue;
    }
    const to = path.join(dest, name);
    copyDirRecursive(from, to);
    console.log("copied", name);
  }
}

function writeIndexHtml(headInnerFixed) {
  const home = readSourceHtml("Kidty Shop - Trang Chủ.html");
  const htmlAttrs = extractHtmlOpenTag(home);
  const indexPath = path.join(REPO, "index.html");
  const next = `<!DOCTYPE html>
<!-- Generated from Kidty Shop - Trang Chủ.html head; body is SPA mount -->
<html ${htmlAttrs ? htmlAttrs : 'lang="vi"'}>
<head>
${headInnerFixed}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`;
  fs.writeFileSync(indexPath, next, "utf8");
  console.log("wrote index.html");
}

function main() {
  copyAssetFolders();

  const homeHtml = readSourceHtml("Kidty Shop - Trang Chủ.html");
  const headInner = extractHeadInner(homeHtml);
  writeIndexHtml(fixAssetPaths(headInner));

  const genDir = path.join(REPO, "src", "generated");
  fs.mkdirSync(genDir, { recursive: true });

  const meta = [];

  for (const page of PAGE_SOURCES) {
    const raw = readSourceHtml(page.file);
    const { prelude, header, mainOpenTag, mainInner, post } = extractBodyParts(raw);
    const postParts = stripScripts(post);

    const base = path.join(genDir, page.id);
    fs.writeFileSync(base + "-prelude.html", fixAssetPaths(prelude), "utf8");
    fs.writeFileSync(base + "-header.html", fixAssetPaths(header), "utf8");
    fs.writeFileSync(base + "-post.html", fixAssetPaths(postParts.html), "utf8");
    fs.writeFileSync(
      base + "-scripts.json",
      JSON.stringify(postParts.scripts, null, 0),
      "utf8",
    );

    let mainInnerOut = fixAssetPaths(mainInner);
    const entry = {
      id: page.id,
      bodyClass: page.bodyClass,
      mainProps: mainPropsFromOpenTag(mainOpenTag),
      paginate: Boolean(page.paginate),
    };

    if (page.paginate) {
      const sp = splitTatCaMainInner(mainInnerOut);
      fs.writeFileSync(base + "-main-before.html", sp.before, "utf8");
      fs.writeFileSync(base + "-list-inner.html", sp.listInner, "utf8");
      fs.writeFileSync(base + "-main-after.html", sp.after, "utf8");
    } else {
      fs.writeFileSync(base + "-main.html", mainInnerOut, "utf8");
    }

    meta.push(entry);
  }

  fs.writeFileSync(path.join(genDir, "pages-meta.json"), JSON.stringify(meta, null, 2), "utf8");
  console.log("wrote generated fragments + pages-meta.json");
}

main();
