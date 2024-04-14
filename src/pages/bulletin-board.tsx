import { NewsCard } from "@/features/news/NewsCard";
import { trpc } from "@/utils/trpc";
import { Skeleton, Stack } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";

const BulletinBoardPage = () => {
  const { t } = useTranslation("news");

  const { data, isLoading } = trpc.newsRouter.fetch.useQuery();

  return (
    <div className="space-y-2 p-2 md:p-0">
      <h1 className="text-white text-3xl">{t("common:bulletin_board")}</h1>
      {!data || isLoading ? (
        <div className="mx-2">
          <Stack>
            <Skeleton height="300px" />
          </Stack>
        </div>
      ) : (
        <div>
          {data.length > 0 ? (
            data.map((news) => <NewsCard news={news} key={news.id} />)
          ) : (
            <div className="flex justify-center text-white text-xl my-12">
              <p>{t("no_news")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulletinBoardPage;
