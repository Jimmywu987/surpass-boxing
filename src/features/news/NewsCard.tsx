import { ContentRenderer } from "@/features/common/components/ContentRenderer";
import { Prisma } from "@prisma/client";
import Link from "next/link";

import { OutputData } from "@editorjs/editorjs";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import { FC, ReactNode, useMemo } from "react";

type NewsCardProps = {
  news: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: Prisma.JsonValue;
    img: string;
  };
};

export const NewCardContainer: FC<{ children: ReactNode } & NewsCardProps> = ({
  children,
  news,
}) => {
  const { content } = news as unknown as {
    content: OutputData;
  };
  const link = useMemo(() => {
    if (!content) {
      return null;
    }
    const links = content.blocks.filter((block) => block.type === "link");
    if (links.length === 0) {
      return null;
    }
    return links[0];
  }, []);
  if (!link) {
    return <>{children}</>;
  }

  return (
    <Link
      href={link.data.link}
      key={link.data.link}
      target="_blank"
      passHref
      className="text-white"
    >
      {children}
    </Link>
  );
};
export const NewsCard = ({ news }: NewsCardProps) => {
  const { t } = useTranslation("news");

  return (
    <div className="space-y-4 border-b border-b-gray-600 py-2">
      <h2 className="text-3xl font-semibold text-white border-b-2 border-b-theme-color inline pb-1">
        {news.title}
      </h2>
      <NewCardContainer news={news}>
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
      </NewCardContainer>
      <div className="text-white text-lg">
        {t("published_date")}: {format(news.createdAt, "yyyy-MM-dd")}
      </div>
      {news.content && (
        <div>
          <ContentRenderer content={news.content as unknown as OutputData} />
        </div>
      )}
    </div>
  );
};
