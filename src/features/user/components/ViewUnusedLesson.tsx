import { UserType } from "@/types";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";

export const ViewUnusedLesson = ({
  onClick,
  lessons,
}: {
  onClick: () => void;
  lessons: UserType["lessons"];
}) => {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-2">
      <ChevronLeftIcon fontSize="3xl" cursor={"pointer"} onClick={onClick} />
      <div className="space-y-2">
        {lessons.length !== 0 ? (
          lessons.map(({ lesson, expiryDate, startDate, level }, index) => (
            <div key={index} className="flex justify-between items-end">
              <div>
                <p>
                  {t("admin:lesson_number")}: {lesson}
                </p>
                <p>
                  {t("admin:start_date")}:{" "}
                  {format(new Date(startDate), "dd/MM/yyyy")}
                </p>
                <p>
                  {t("admin:expired_date")}:{" "}
                  {format(new Date(expiryDate), "dd/MM/yyyy")}
                </p>
                <p>{t(level.toLowerCase())}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-blueGray-700">
            <p>{t("classes:no_assigned_lesson")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
