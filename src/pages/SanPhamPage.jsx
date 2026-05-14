import prelude from "../generated/san-pham-prelude.html?raw";
import header from "../generated/san-pham-header.html?raw";
import postHtml from "../generated/san-pham-post.html?raw";
import mainHtml from "../generated/san-pham-main.html?raw";
import scripts from "../generated/san-pham-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";

export default function SanPhamPage() {
  return (
    <KidtyDocument
      bodyClass="collection"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main className="mainContent-theme " dangerouslySetInnerHTML={{ __html: mainHtml }} />
    </KidtyDocument>
  );
}
