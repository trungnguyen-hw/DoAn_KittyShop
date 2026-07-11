import prelude from "../generated/trang-chu-prelude.html?raw";
import header from "../generated/trang-chu-header.html?raw";
import postHtml from "../generated/trang-chu-post.html?raw";
import mainHtml from "../generated/trang-chu-main.html?raw";
import scripts from "../generated/trang-chu-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";

export default function TrangChuPage() {
  return (
    <KidtyDocument
      bodyClass="index"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main
        className="mainContent-theme  main-index "
        dangerouslySetInnerHTML={{ __html: mainHtml }}
      />
    </KidtyDocument>
  );
}
