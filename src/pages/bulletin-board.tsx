import { ContentRenderer } from "@/features/common/components/ContentRenderer";
import { trpc } from "@/utils/trpc";
import { Skeleton, Stack } from "@chakra-ui/react";
import { OutputData } from "@editorjs/editorjs";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

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
            data.map((news, index) => (
              <div
                key={index}
                className="space-y-4 border-b border-b-gray-600 py-2"
              >
                <h2 className="text-3xl font-semibold text-white border-b-2 border-b-theme-color inline pb-1">
                  {news.title}
                </h2>
                <div className="flex justify-center items-center">
                  <div className="relative w-full h-96 md:h-[650px]">
                    <Image
                      fill
                      src={news.img}
                      alt={`${news.title} - image`}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="text-white text-lg">
                  {t("published_date")}: {format(news.createdAt, "yyyy-MM-dd")}
                </div>
                {news.content && (
                  <div>
                    <ContentRenderer
                      content={news.content as unknown as OutputData}
                    />
                  </div>
                )}
              </div>
            ))
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
