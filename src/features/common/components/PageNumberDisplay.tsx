import { Dispatch, SetStateAction } from "react";

export const PageNumberDisplay = ({
  currentPage,
  setQuery,
  totalPages,
}: {
  setQuery: Dispatch<SetStateAction<{ skip: number }>>;
  currentPage: number;
  totalPages: number;
}) => {
  if (totalPages <= 5) {
    return (
      <div className="flex space-x-1">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={
              currentPage === index + 1
                ? "opacity-40"
                : "text-white cursor-pointer"
            }
            disabled={currentPage === index + 1}
            onClick={() => {
              setQuery((pre) => ({ ...pre, skip: index * 10 }));
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    );
  }
  if (currentPage <= 3) {
    return (
      <div>
        {[...Array(3)].map((_, index) => (
          <>
            {" "}
            <button
              key={index}
              className={
                currentPage === index + 1
                  ? "text-white cursor-default"
                  : "opacity-40"
              }
              onClick={() => {
                setQuery((pre) => ({ ...pre, skip: index * 10 }));
              }}
              disabled={currentPage === index + 1}
            >
              {index + 1}
            </button>
            <span className="opacity-40"> ,</span>
          </>
        ))}

        <span className="opacity-40"> ... </span>
        <span className="opacity-40">, </span>
        <button
          className="opacity-40"
          onClick={() => {
            setQuery((pre) => ({ ...pre, skip: totalPages * 10 - 10 }));
          }}
        >
          {totalPages}
        </button>
      </div>
    );
  }
  if (currentPage >= totalPages - 3) {
    return (
      <div>
        <button
          className="opacity-40"
          onClick={() => {
            setQuery((pre) => ({ ...pre, skip: 0 }));
          }}
        >
          1
        </button>
        <span className="opacity-40"> , </span>

        <span className="opacity-40"> ... </span>
        {[2, 1, 0].map((minusPage, index) => {
          const page = totalPages - minusPage;
          return (
            <>
              <span className="opacity-40"> , </span>
              <button
                key={index}
                className={
                  currentPage === page
                    ? "text-white cursor-default"
                    : "opacity-40"
                }
                disabled={currentPage === page}
                onClick={() => {
                  setQuery((pre) => ({ ...pre, skip: page * 10 - 10 }));
                }}
              >
                {page}
              </button>
            </>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex space-x-1">
      {[
        1,
        null,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        null,
        totalPages,
      ].map((page, index) => {
        const isCurrentPage =
          currentPage === page && index !== 1 && page !== totalPages && !!page;
        if (!page) {
          return (
            <div key={index} className="opacity-40">
              <span>,</span>
              <span className=" opacity-40" key={index}>
                ...
              </span>
            </div>
          );
        }
        return (
          <div key={index} className="space-x-1">
            {page === currentPage && <span className="opacity-40">,</span>}
            <button
              disabled={isCurrentPage}
              className={`${
                isCurrentPage ? "text-white cursor-default" : "opacity-40"
              }`}
              onClick={() => {
                setQuery((pre) => ({ ...pre, skip: page * 10 - 10 }));
              }}
            >
              {page}
            </button>
            {page === currentPage && <span className="opacity-40">,</span>}
          </div>
        );
      })}
    </div>
  );
};
