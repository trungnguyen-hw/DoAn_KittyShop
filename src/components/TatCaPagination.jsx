
export function TatCaPagination({ page, onChangePage, totalPages = 3 }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="clearfix">
      {pages.map((n) => (
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
    </div>
  );
}
