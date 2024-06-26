import { ModalComponent } from "@/features/common/components/Modal";

import { useDisclosure, Button } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { NewsForm } from "@/features/admin/components/form/NewsForm";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { deleteFile } from "@/utils/s3Uploader";
import { ContentRenderer } from "@/features/common/components/ContentRenderer";
import { OutputData } from "@editorjs/editorjs";
import { NewCardContainer } from "@/features/news/NewsCard";

export const AdminNews = () => {
  const { t } = useTranslation("admin");

  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;
  const utils = trpc.useContext();

  const { data } = trpc.newsRouter.fetch.useQuery();
  const { mutateAsync, isLoading } = trpc.newsRouter.remove.useMutation({
    onSuccess: () => {
      utils.newsRouter.fetch.invalidate();
    },
  });
  const removeArticle = async ({ id, url }: { id: string; url: string }) => {
    if (!isLoading) {
      try {
        await mutateAsync({ id });
        await deleteFile(url);
      } catch (error) {}
    }
  };

  return (
    <>
      <div className="w-full space-y-2">
        <div className="border-b border-b-gray-600 py-2 ">
          <Button
            onClick={() => {
              onOpen();
            }}
            colorScheme="whiteAlpha"
            variant="solid"
          >
            {t("add_news")}
          </Button>
        </div>
        <div>
          {data && data.length > 0 ? (
            data.map((news, index) => (
              <div
                key={index}
                className="space-y-2 border-b border-b-gray-600 py-2"
              >
                <div className="flex justify-between my-2">
                  <h2 className="text-4xl font-semibold">{news.title}</h2>{" "}
                  <SmallCloseIcon
                    className={`${
                      isLoading ? "bg-gray-300" : "cursor-pointer bg-black"
                    } text-2xl `}
                    onClick={async () => {
                      await removeArticle({ id: news.id, url: news.img });
                    }}
                  />
                </div>
                <NewCardContainer news={news}>
                  <div className="relative h-72 w-72">
                    <Image
                      fill
                      src={news.img}
                      alt={`${news.title} - image`}
                      className="object-contain"
                    />
                  </div>
                </NewCardContainer>

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
            <div className="text-center w-full">
              <p>{t("no_news")}</p>
            </div>
          )}
        </div>
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={<NewsForm modalDisclosure={modalDisclosure} />}
      />
    </>
  );
};
