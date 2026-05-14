import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import prelude1 from "../generated/dam-style-1-prelude.html?raw";
import header1 from "../generated/dam-style-1-header.html?raw";
import post1 from "../generated/dam-style-1-post.html?raw";
import main1 from "../generated/dam-style-1-main.html?raw";
import scripts1 from "../generated/dam-style-1-scripts.json";
import prelude2 from "../generated/dam-style-2-prelude.html?raw";
import header2 from "../generated/dam-style-2-header.html?raw";
import post2 from "../generated/dam-style-2-post.html?raw";
import main2 from "../generated/dam-style-2-main.html?raw";
import scripts2 from "../generated/dam-style-2-scripts.json";
import prelude3 from "../generated/dam-style-3-prelude.html?raw";
import header3 from "../generated/dam-style-3-header.html?raw";
import post3 from "../generated/dam-style-3-post.html?raw";
import main3 from "../generated/dam-style-3-main.html?raw";
import scripts3 from "../generated/dam-style-3-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";

const BUNDLES = {
  1: {
    prelude: prelude1,
    header: header1,
    postHtml: post1,
    mainHtml: main1,
    scripts: scripts1,
  },
  2: {
    prelude: prelude2,
    header: header2,
    postHtml: post2,
    mainHtml: main2,
    scripts: scripts2,
  },
  3: {
    prelude: prelude3,
    header: header3,
    postHtml: post3,
    mainHtml: main3,
    scripts: scripts3,
  },
};

function resolveVariant(search) {
  const view = search.get("view");
  if (view === "style-01") return 1;
  if (view === "style-02") return 2;
  if (view === "style-03") return 3;
  return 3;
}

export default function DamFm45Page() {
  const [searchParams] = useSearchParams();
  const variant = useMemo(
    () => resolveVariant(searchParams),
    [searchParams],
  );
  const b = BUNDLES[variant];

  return (
    <KidtyDocument
      bodyClass="product"
      prelude={b.prelude}
      header={b.header}
      postHtml={b.postHtml}
      scripts={b.scripts}
    >
      <main className="mainContent-theme " dangerouslySetInnerHTML={{ __html: b.mainHtml }} />
    </KidtyDocument>
  );
}
