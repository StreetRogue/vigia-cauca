import styles from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  const maxVisible = 5;
  let startNum = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let endNum = Math.min(totalPages, startNum + maxVisible);

  if (endNum - startNum < maxVisible) {
    startNum = Math.max(0, endNum - maxVisible);
  }

  for (let i = startNum; i < endNum; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.container}>
      <span className={styles.info}>
        Mostrando {startItem}-{endItem} de {totalElements} resultados · Página {currentPage + 1} de {Math.max(totalPages, 1)}
      </span>

      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={handlePrevious}
          disabled={isFirstPage}
          aria-label="Página anterior"
          title="Anterior"
        >
          ←
        </button>

        <div className={styles.pageNumbers}>
          {startNum > 0 && (
            <>
              <button
                className={styles.pageBtn}
                onClick={() => onPageChange(0)}
              >
                1
              </button>
              {startNum > 1 && <span className={styles.dots}>...</span>}
            </>
          )}

          {pageNumbers.map((num) => (
            <button
              key={num}
              className={[styles.pageBtn, num === currentPage ? styles.active : ""].filter(Boolean).join(" ")}
              onClick={() => onPageChange(num)}
            >
              {num + 1}
            </button>
          ))}

          {endNum < totalPages && (
            <>
              {endNum < totalPages - 1 && <span className={styles.dots}>...</span>}
              <button
                className={styles.pageBtn}
                onClick={() => onPageChange(totalPages - 1)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className={styles.btn}
          onClick={handleNext}
          disabled={isLastPage}
          aria-label="Página siguiente"
          title="Siguiente"
        >
          →
        </button>
      </div>
    </div>
  );
}
