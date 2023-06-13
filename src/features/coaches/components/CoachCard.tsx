import { CoachInfos } from "@prisma/client";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

export const CoachCard = ({
  coachInfo,
}: {
  coachInfo: {
    coachInfos: CoachInfos[];
    coachName: string;
    profileImg: string;
  };
}) => {
  const { lang } = useTranslation("coaches");
  const langIsZh = lang === "zh-HK";

  return (
    <div className="flex flex-col md:flex-row my-12 md:space-x-3 border border-gray-400 rounded w-full md:w-auto mx-2">
      <div className="relative h-[450px] w-full md:w-[450px]">
        <Image
          fill
          src={coachInfo.profileImg}
          className="object-contain"
          alt="coach image"
        />
      </div>
      <div className="text-white space-y-4 p-3 text-center md:text-left">
        <p className="text-2xl font-semibold pb-1 border-b-2 border-b-theme-color inline">
          {coachInfo.coachName}
        </p>
        <div className="space-y-1 text-lg w-full md:w-[450px]">
          {coachInfo.coachInfos.map((info, index) => {
            const title = langIsZh
              ? info.zhTitle
              : info.enTitle ?? info.zhTitle;
            return <p key={index}>{title}</p>;
          })}
        </div>
      </div>
    </div>
  );
};
