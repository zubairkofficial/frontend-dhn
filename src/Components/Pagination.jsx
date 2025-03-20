import React from "react";

const Pagination = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const visiblePages = 4;

  // Calculate page numbers to show
  let startPage = Math.max(0, currentPage - Math.floor(visiblePages / 2));
  let endPage = startPage + visiblePages;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(0, endPage - visiblePages);
  }

  const pageNumbers = Array.from({ length: endPage - startPage }, (_, i) => startPage + i);

  // Navigation handlers
  const onFirstPage = () => onPageChange(0);
  const onLastPage = () => onPageChange(totalPages - 1);
  const onPreviousPage = () => onPageChange(Math.max(0, currentPage - 1));
  const onNextPage = () => onPageChange(Math.min(totalPages - 1, currentPage + 1));

  return (
    <div className="flex justify-between items-center p-4">
      <div className="text-lg">
        Showing {Math.min(currentPage * itemsPerPage + 1, totalItems)} to
        {Math.min((currentPage + 1) * itemsPerPage, totalItems)} of {totalItems} entries
      </div>
      <ul className="flex list-none gap-2">
        <li className={`p-2 cursor-pointer ${currentPage === 0 ? "text-gray-400" : "text-blue-600"}`}
          onClick={onFirstPage}>&laquo;</li>
        <li className={`p-2 cursor-pointer ${currentPage === 0 ? "text-gray-400" : "text-blue-600"}`}
          onClick={onPreviousPage}>&lt;</li>
        {pageNumbers.map(number => (
          <li key={number}
            className={`p-2 cursor-pointer ${number === currentPage ? "text-blue-600 font-bold" : "text-gray-700"}`}
            onClick={() => onPageChange(number)}>
            {number + 1}
          </li>
        ))}
        <li className={`p-2 cursor-pointer ${currentPage === totalPages - 1 ? "text-gray-400" : "text-blue-600"}`}
          onClick={onNextPage}>&gt;</li>
        <li className={`p-2 cursor-pointer ${currentPage === totalPages - 1 ? "text-gray-400" : "text-blue-600"}`}
          onClick={onLastPage}>&raquo;</li>
      </ul>
    </div>
  );
};

export default Pagination;
