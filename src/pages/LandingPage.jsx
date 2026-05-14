import prelude from "../generated/landing-prelude.html?raw";
import header from "../generated/landing-header.html?raw";
import postHtml from "../generated/landing-post.html?raw";
import mainHtml from "../generated/landing-main.html?raw";
import scripts from "../generated/landing-scripts.json";
import { KidtyDocument } from "../components/kidty/KidtyDocument.jsx";

export default function LandingPage() {
  return (
    <KidtyDocument
      bodyClass="page"
      prelude={prelude}
      header={header}
      postHtml={postHtml}
      scripts={scripts}
    >
      <main className="mainContent-theme " dangerouslySetInnerHTML={{ __html: mainHtml }} />
    </KidtyDocument>
  );
}
