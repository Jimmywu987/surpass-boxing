import { UserType } from "@/types";
import useTranslation from "next-translate/useTranslation";

import { ChevronLeftIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import { Dispatch, SetStateAction } from "react";

import { trpc } from "@/utils/trpc";

export const ViewUnusedClass = ({
  lessons,
  onClick,
  setViewAccount,
}: {
  lessons: UserType["lessons"];
  onClick: () => void;
  setViewAccount: Dispatch<SetStateAction<UserType>>;
}) => {
  const { t } = useTranslation("classes");

  const utils = trpc.useContext();
  const { mutateAsync, isLoading } = trpc.lessonClassRouter.remove.useMutation({
    onSuccess: () => {
      utils.userRouter.fetch.invalidate();
      utils.userRouter.fetchForAdmin.invalidate();
    },
  });
  const removeLesson = async (id: string) => {
    await mutateAsync({ id });
    setViewAccount((prev) => {
      return {
        ...prev,
        lessons: prev.lessons.filter((lesson) => lesson.id !== id),
      };
    });
  };
  return (
    <div className="space-y-2">
      <ChevronLeftIcon fontSize="3xl" cursor={"pointer"} onClick={onClick} />
      <div className="space-y-2">
        {lessons.map(({ lesson, expiryDate, startDate, id, level }, index) => (
          <div
            key={index}
            className="flex justify-between items-end border-2 border-gray-100 rounded"
          >
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
            <button
              className="bg-red-600 px-2 py-1 text-white rounded hover:bg-red-500"
              onClick={async () => {
                await removeLesson(id);
              }}
              disabled={isLoading}
            >
              {t("common:action.delete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
