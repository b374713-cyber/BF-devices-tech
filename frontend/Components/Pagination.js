import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);
            
            if (start > 2) pages.push('...');
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <nav className="mt-4">
            <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                        className="page-link rounded-start-pill"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft /> Previous
                    </button>
                </li>
                
                {getPageNumbers().map((page, index) => (
                    <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                        {page === '...' ? (
                            <span className="page-link">...</span>
                        ) : (
                            <button 
                                className="page-link"
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </button>
                        )}
                    </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                        className="page-link rounded-end-pill"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next <FaChevronRight />
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Pagination;