import { createRoot } from "react-dom/client";
import { useEffect, useRef } from "react";

export function TatCaPagination({ page, onChangePage }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const host = document.getElementById("pagination");
    if (!host) return;
    if (!rootRef.current) {
      rootRef.current = createRoot(host);
    }
    rootRef.current.render(
      <div className="clearfix">
        {[1, 2, 3].map((n) => (
          <a
            key={n}
            href="#"
            className={n === page ? "page-node current" : "page-node"}
            onClick={(e) => {
              e.preventDefault();
              onChangePage(n);
            }}
          >
            {n}
          </a>
        ))}
      </div>,
    );
  }, [page, onChangePage]);

  useEffect(() => {
    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, []);

  return null;
}
