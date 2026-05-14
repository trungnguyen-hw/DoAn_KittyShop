import prelude from "../generated/tin-tuc-prelude.html?raw";
import header from "../generated/tin-tuc-header.html?raw";
import postHtml from "../generated/tin-tuc-post.html?raw";
import mainHtml from "../generated/tin-tuc-main.html?raw";
import scripts from "../generated/tin-tuc-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";

export default function TinTucPage() {
  return (
    <KidtyDocument
      bodyClass="blog"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main className="mainContent-theme " dangerouslySetInnerHTML={{ __html: mainHtml }} />
    </KidtyDocument>
  );
}
