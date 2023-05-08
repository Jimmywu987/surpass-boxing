import { UserType } from "@/types";
import useTranslation from "next-translate/useTranslation";

import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { useAddClassInputResolver } from "@/features/admin/schemas/useAddClassInputResolver";
import { format, isAfter, add } from "date-fns";
import { Dispatch, SetStateAction, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { AccountBasicInfo } from "@/features/admin/components/AdminAccount/AccountBasicInfo";
import { trpc } from "@/utils/trpc";
import { ClassLevelEnum } from "@prisma/client";

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
  const utils = trpc.useContext();
  const { mutateAsync } = trpc.lessonClassRouter.addLesson.useMutation();
  const addClassInputFormMethods = useForm({
    resolver: useAddClassInputResolver(),
    mode: "onChange",
    defaultValues: {
      lesson: 5,
      duration: 1,
      durationUnit: "months",
      userId: account.id,
      level: ClassLevelEnum.BEGINNER,
    },
  });
  const { handleSubmit, formState, register, setValue, watch } =
    addClassInputFormMethods;

  const unusedLessonNum = useMemo(
    () =>
      account.lessons
        ?.filter((lesson) => isAfter(new Date(lesson.expiryDate), new Date()))
        .reduce((pre, cur) => pre + cur.lesson, 0) ?? 0,
    [account.lessons]
  );

  const AddClass = handleSubmit(async (data) => {
    const result = await mutateAsync(data);
    setViewAccount((prev) => {
      return {
        ...prev,
        lessons: [...prev.lessons, result],
      };
    });
    utils.userRouter.fetch.invalidate();
    utils.userRouter.fetchForAdmin.invalidate();
  });
  return (
    <div className="flex flex-col space-y-2">
      <AccountBasicInfo account={account} />
      <div className="flex justify-between">
        <p>
          {t("admin:total_lessons")}: {account.userOnBookingTimeSlots.length}
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
              <select
                className="outline-none border-l border-l-gray-300"
                {...register("level")}
              >
                {Object.values(ClassLevelEnum).map((level, index) => (
                  <option value={level} key={index}>
                    {t(`classes:${level.toLowerCase()}`)}
                  </option>
                ))}
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
        <div>
          <p>
            {t("admin:expired_date")}:{" "}
            {format(
              add(new Date(), {
                [watch("durationUnit")]: watch("duration"),
              }),
              "dd/MM/yyyy"
            )}
          </p>
        </div>
      </FormProvider>
      <button
        className=" hover:bg-red-400 bg-red-500 px-3 py-1 rounded-md text-white self-start"
        onClick={() =>
          setView(AdminViewAccountOptionEnums.VIEW_CONFIRM_GRANT_AUTH)
        }
      >
        {t("admin:action.grant_authorization")}
      </button>
    </div>
  );
};
