import { UserType } from "@/types";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import DefaultProfileImg from "@/../public/default-profile-img.png";

import Link from "next/link";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { Dispatch, SetStateAction, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAddClassInputResolver } from "@/features/admin/schemas/useAddClassInputResolver";
import { useAddClassMutation } from "@/apis/api";

const REG_NUM_CHECK = /^\d+$/;

export const ViewAccount = ({
  account,
  setView,
  setViewAccount,
}: {
  account: UserType;
  setView: Dispatch<SetStateAction<AdminViewAccountOptionEnums>>;
  setViewAccount: Dispatch<SetStateAction<UserType>>;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutateAsync } = useAddClassMutation();
  const addClassInputFormMethods = useForm({
    resolver: useAddClassInputResolver(),
    mode: "onChange",
    defaultValues: {
      lesson: 5,
      duration: 1,
      durationUnit: "months",
      userId: account.id,
    },
  });
  const { handleSubmit, formState, register, setValue } =
    addClassInputFormMethods;
  const unusedLessonNum =
    account.lessons?.filter((lesson) => lesson.expiryDate > new Date())
      .length ?? 0;

  const AddClass = handleSubmit(async (data) => {
    const result = await mutateAsync(data);
    setViewAccount((prev) => {
      return {
        ...prev,
        lessons: [...prev.lessons, result],
      };
    });
    queryClient.invalidateQueries("users");
  });
  return (
    <div className="flex flex-col space-y-2">
      <Link
        href={`/profile/${account.id}`}
        passHref
        className="flex items-center space-x-2 transition hover:bg-link-bgHover  text-white hover:text-theme-color rounded p-1 text-lg text-link-normal "
      >
        <div className="w-10 h-10 relative">
          <Image
            src={account.profileImg ?? DefaultProfileImg}
            alt={`${account.username} profile image`}
            className="w-full h-full rounded-full object-cover"
            fill
          />
        </div>
      </Link>
      <p>
        {t("common:account.username")}: {account.username}
      </p>
      <p>
        {t("common:account.email_address")}: {account.email}
      </p>
      <p>
        {t("common:account.phone_number")}:{" "}
        {!!account.phoneNumber ? account.phoneNumber : "--"}
      </p>
      <p>
        {t("common:account.created_at")}:{" "}
        {format(new Date(account.createdAt!), "yyyy-MM-dd")}
      </p>

      <div className="flex justify-between">
        <p>
          {t("admin:total_lessons")}: {account.lessons?.length ?? 0}
        </p>
        <button
          className="hover:bg-gray-400 bg-gray-500 px-3 py-1 rounded-md text-white"
          onClick={() => setView(AdminViewAccountOptionEnums.VIEW_USED_CLASS)}
        >
          {t("admin:check")}
        </button>
      </div>
      <div className="flex justify-between">
        <p>
          {t("admin:unused_lessons")}: {unusedLessonNum}
        </p>
        <button
          className="hover:bg-yellow-400 bg-yellow-500 px-3 py-1  rounded-md text-white"
          onClick={() => setView(AdminViewAccountOptionEnums.VIEW_UNUSED_CLASS)}
        >
          {t("admin:edit")}
        </button>
      </div>
      <FormProvider {...addClassInputFormMethods}>
        <form className="flex justify-between">
          <div className="flex border border-gray-100 justify-between">
            <div className="flex space-x-2 border border-gray-300 p-1">
              <p>{t("admin:lesson_number")}: </p>
              <input
                type="number"
                className="w-5 outline-none"
                defaultValue={5}
                name="lesson"
                onChange={(e) => {
                  const { valueAsNumber } = e.target;
                  setValue("lesson", valueAsNumber, {
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            <div className="flex border border-gray-300 p-1 ">
              <div className="flex space-x-2  ">
                <p>{t("admin:duration")}: </p>
                <input
                  type="number"
                  className="w-6 outline-none"
                  defaultValue={1}
                  name="duration"
                  onChange={(e) => {
                    const { valueAsNumber } = e.target;
                    setValue("duration", valueAsNumber, {
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
              <select
                className="outline-none border-l border-l-gray-300"
                {...register("durationUnit")}
              >
                <option value="days">{t("classes:day")}</option>
                <option value="weeks">{t("classes:week")}</option>
                <option value="months">{t("classes:month")}</option>
                <option value="years">{t("classes:year")}</option>
              </select>
            </div>
          </div>
          <button
            className={`${
              formState.isValid
                ? "hover:bg-green-400 bg-green-500"
                : "bg-gray-300"
            }  px-3 rounded-md text-white`}
            onClick={AddClass}
            disabled={!formState.isValid}
          >
            {t("admin:add_lesson")}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};
