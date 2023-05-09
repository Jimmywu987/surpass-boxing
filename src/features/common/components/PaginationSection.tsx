import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Dispatch, SetStateAction } from "react";

import { SKIP_NUMBER, TAKE_NUMBER } from "@/constants";
import { PageNumberDisplay } from "@/features/common/components/PageNumberDisplay";
import useTranslation from "next-translate/useTranslation";

export const PaginationSection = ({
  setQuery,
  totalCount,
  query,
}: {
  setQuery: Dispatch<
    SetStateAction<{
      skip: number;
    }>
  >;
  totalCount: number;
  query: { skip: number };
}) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-between">
      <button
        className={`flex space-x-1 items-center ${
          query.skip === 0 && " cursor-default opacity-40 "
        }`}
        onClick={() => {
          setQuery((prev) => ({
            ...prev,
            skip: prev.skip - SKIP_NUMBER,
          }));
        }}
        disabled={query.skip === 0}
      >
        <ChevronLeftIcon className="text-xl" />
        <span>{t("action.previous")}</span>
      </button>
      <PageNumberDisplay
        currentPage={query.skip / TAKE_NUMBER + 1}
        totalPages={Math.ceil(totalCount / TAKE_NUMBER)}
        setQuery={setQuery as Dispatch<SetStateAction<{ skip: number }>>}
      />
      <button
        className={`flex space-x-1 items-center ${
          totalCount < query.skip + SKIP_NUMBER && " cursor-default opacity-40 "
        }`}
        onClick={() => {
          setQuery((prev) => ({
            ...prev,
            skip: prev.skip + SKIP_NUMBER,
          }));
        }}
        disabled={totalCount < query.skip + SKIP_NUMBER}
      >
        <span>{t("action.next")}</span>
        <ChevronRightIcon className="text-xl" />
      </button>
    </div>
  );
};
