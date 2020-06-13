import React from 'react';
import ReactPaginate from 'react-paginate';
import './pagination.css';

function PaginationComponent({ pageCount, onPageChange }) {
    const isMobile = () => window.innerWidth <= 1080;
    const isXS = () => window.innerWidth <= 468;

    return pageCount <= 0 ? null : (
        <ReactPaginate
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={pageCount}
            marginPagesDisplayed={isXS() ? 1 : 2}
            pageRangeDisplayed={isXS() ? 1 : isMobile() ? 2 : 5}
            onPageChange={onPageChange}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
        />
    );
}

export default PaginationComponent;
