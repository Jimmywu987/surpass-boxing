import { UserType } from "@/types";
import useTranslation from "next-translate/useTranslation";

import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Lessons } from "@prisma/client";
import { format } from "date-fns";
import { Dispatch, SetStateAction } from "react";
import { useDispatch } from "react-redux";

import { trpc } from "@/utils/trpc";

export const ViewUnusedClass = ({
  lessons,
  setView,
  setViewAccount,
}: {
  lessons: UserType["lessons"];
  setView: Dispatch<SetStateAction<AdminViewAccountOptionEnums>>;
  setViewAccount: Dispatch<SetStateAction<UserType>>;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();

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
      <ChevronLeftIcon
        fontSize="3xl"
        cursor={"pointer"}
        onClick={() => {
          setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT);
        }}
      />
      <div className="space-y-2">
        {lessons.map(({ lesson, expiryDate, id, level }, index) => (
          <div key={index} className="flex justify-between items-end">
            <div>
              <p>
                {t("admin:lesson_number")}: {lesson}
              </p>
              <p>
                {t("admin:expired_date")}:{" "}
                {format(new Date(expiryDate), "dd/MM/yyyy")}
              </p>
              <p>{t(level?.toLowerCase())}</p>
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
