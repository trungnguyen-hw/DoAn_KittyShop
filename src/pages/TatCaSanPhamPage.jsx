import { useLayoutEffect, useRef, useState } from "react";
import after from "../generated/tat-ca-main-after.html?raw";
import before from "../generated/tat-ca-main-before.html?raw";
import listInner from "../generated/tat-ca-list-inner.html?raw";
import header from "../generated/tat-ca-header.html?raw";
import postHtml from "../generated/tat-ca-post.html?raw";
import prelude from "../generated/tat-ca-prelude.html?raw";
import scripts from "../generated/tat-ca-scripts.json";
import { TatCaPagination } from "../components/TatCaPagination.jsx";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";

export default function TatCaSanPhamPage() {
  const [page, setPage] = useState(1);
  const listHostRef = useRef(null);

  useLayoutEffect(() => {
    const el = listHostRef.current;
    if (!el) return;
    const banner = `<div class="col-sm-12 col-xs-12 text-center"><p>Demo phân trang — trang ${page} / 3</p></div>`;
    el.innerHTML = banner + listInner;
  }, [page]);

  return (
    <KidtyDocument
      bodyClass="collection"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main className="mainContent-theme ">
        <div dangerouslySetInnerHTML={{ __html: before }} />
        <div
          ref={listHostRef}
          className="content-product-list product-list filter clearfix"
        />
        <div dangerouslySetInnerHTML={{ __html: after }} />
        <TatCaPagination page={page} onChangePage={setPage} />
      </main>
    </KidtyDocument>
  );
}
