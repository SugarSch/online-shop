import React from 'react';
import { Pagination } from 'react-bootstrap';

function PaginationSection({ currentPage, totalPages, onPageChange }) {
    return <Pagination>
        <Pagination.Prev disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} />
        {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => onPageChange(i + 1)}>        {i + 1}</Pagination.Item>
        ))}
        <Pagination.Next disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} />
    </Pagination>
}

export default PaginationSection;