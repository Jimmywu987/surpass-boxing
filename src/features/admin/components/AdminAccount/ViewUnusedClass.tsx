import { UserType } from "@/types";
import { UseDisclosureReturn } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import DefaultProfileImg from "@/../public/default-profile-img.png";

import Link from "next/link";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { Dispatch, SetStateAction, useState } from "react";
import { Lessons } from "@prisma/client";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useRemoveLessonMutation } from "@/apis/api";

export const ViewUnusedClass = ({
  lessons,
  setView,
  setViewAccount,
}: {
  lessons: Lessons[];
  setView: Dispatch<SetStateAction<AdminViewAccountOptionEnums>>;
  setViewAccount: Dispatch<SetStateAction<UserType>>;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useRemoveLessonMutation({
    onSuccess: () => {
      queryClient.invalidateQueries("users");
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
        {lessons.map(({ lesson, expiryDate, id }, index) => (
          <div key={index} className="flex justify-between items-end">
            <div>
              <p>
                {t("admin:lesson_number")}: {lesson}
              </p>
              <p>
                {t("admin:expired_date")}:{" "}
                {format(new Date(expiryDate), "dd/MM/yyyy")}
              </p>
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
