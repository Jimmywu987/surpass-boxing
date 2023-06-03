import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

const CoachesPage = () => {
  const { t } = useTranslation("coaches");

  return (
    <div className="flex justify-center items-center ">
      <div className="flex flex-col md:flex-row my-12 md:space-x-3 border border-gray-400 rounded w-full md:w-auto mx-2">
        <div className="relative h-[450px] w-full md:w-[450px]">
          <Image
            fill
            src="https://surpass-boxing-gym.s3.ap-southeast-1.amazonaws.com/coach.jpg"
            className="object-contain"
            alt="coach image"
          />
        </div>
        <div className="text-white space-y-4 p-3 text-center md:text-left">
          <p className="text-2xl font-semibold pb-1 border-b-2 border-b-theme-color inline">
            {t("CHAN_SIU_PONG")}
          </p>
          <div className="space-y-1 text-lg">
            <p>{t("muay_thai_approved_coach")}</p>
            <p>{t("hk_boxing_approved_coach")}</p>
            <p>{t("AASFP")}</p>
            <p>{t("TRX")}</p>
            <p>{t("Bulgarian")}</p>
            <p>{t("Kettle")}</p>
            <p>{t("stretching_instructor")}</p>
            <p>{t("personal_instructor")}</p>
            <p>{t("nine_years_muay_thai")}</p>
            <p>{t("ten_years_competition_experiences")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachesPage;
