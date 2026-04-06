import React from 'react';
import styles from './TablePagination.module.css';

interface TablePaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50],
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const rangeText = totalItems === 0
        ? 'No results'
        : `${startItem} to ${endItem} of ${totalItems.toLocaleString()}`;

    return (
        <div className={styles.footer}>
            <span className={styles.rangeText}>{rangeText}</span>

            <div className={styles.nav}>
                <button
                    type="button"
                    className="btn"
                    data-variant="tertiary"
                    data-size="s"
                    data-icon-only="true"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(1)}
                    aria-label="First page"
                >
                    <span className="material-symbols-rounded">first_page</span>
                </button>
                <button
                    type="button"
                    className="btn"
                    data-variant="tertiary"
                    data-size="s"
                    data-icon-only="true"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Previous page"
                >
                    <span className="material-symbols-rounded">chevron_left</span>
                </button>

                <span className={styles.pageIndicator}>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    type="button"
                    className="btn"
                    data-variant="tertiary"
                    data-size="s"
                    data-icon-only="true"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Next page"
                >
                    <span className="material-symbols-rounded">chevron_right</span>
                </button>
                <button
                    type="button"
                    className="btn"
                    data-variant="tertiary"
                    data-size="s"
                    data-icon-only="true"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(totalPages)}
                    aria-label="Last page"
                >
                    <span className="material-symbols-rounded">last_page</span>
                </button>
            </div>

            {onPageSizeChange ? (
                <div className={styles.pageSizeSection}>
                    <span className={styles.pageSizeLabel}>Page size</span>
                    <select
                        className={styles.pageSizeSelect}
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className={styles.pageSizeSection}>
                    <span className={styles.pageSizeLabel}>Page size</span>
                    <span>{pageSize}</span>
                </div>
            )}
        </div>
    );
};
