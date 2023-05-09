import { requestedClassCreateSchema } from "@/schemas/class/requested/create";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { getDuration } from "@/helpers/getDuration";
import {
  Input,
  InputGroup,
  Select,
  Skeleton,
  Stack,
  UseDisclosureReturn,
} from "@chakra-ui/react";
import { ClassLevelEnum, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";
import { FormProvider, useForm } from "react-hook-form";
import { SelectCoach } from "@/features/admin/components/form/SelectCoach";

import { useRequestedClassInputResolver } from "@/features/admin/schemas/useRequestedClassInputResolver";
import { format } from "date-fns";
import { WeekSelectionCheckBox } from "@/features/admin/components/form/WeekSelectionCheckBox";
import { trpc } from "@/utils/trpc";
import { z } from "zod";
import { SelectClassType } from "@/features/classes/components/SelectClassType";
import { useRouter } from "next/router";

export const CreateRequestedClassForm = ({
  modalDisclosure,
  date,
}: {
  modalDisclosure: UseDisclosureReturn;
  date: Date;
}) => {
  const { t } = useTranslation("classes");
  const utils = trpc.useContext();
  const router = useRouter();
  const { data: userData } = trpc.userRouter.fetchForAdmin.useQuery();
  const session = useSession();
  const user = session.data?.user as User;
  const { mutateAsync, isLoading } =
    trpc.classRouter.requestedClassRouter.create.useMutation({
      onSuccess: () => {
        if (router.route === "/admin") {
          utils.classRouter.requestedClassRouter.fetch.invalidate();
          return;
        }
        utils.bookingTimeSlotRouter.fetchForStudent.invalidate();
      },
    });

  const { onClose } = modalDisclosure;

  const requestedClassInputFormMethods = useForm<
    z.infer<ReturnType<typeof requestedClassCreateSchema>>
  >({
    resolver: useRequestedClassInputResolver({ withInHours: 12 }),
    mode: "onChange",
    defaultValues: {
      date: date.toString(),
      startTime: 0,
      endTime: 0,
      className: "",
      level: ClassLevelEnum.BEGINNER,
      setLimit: false,
      people: 0,
      coachId: "",
    },
  });
  const { setValue, watch, formState } = requestedClassInputFormMethods;
  const onSubmit = requestedClassInputFormMethods.handleSubmit(async (data) => {
    await mutateAsync(data);

    onClose();
  });
  const { errors, isValid } = formState;
  if (isLoading || !userData) {
    return (
      <Stack mt="12">
        <Skeleton height="350px" />
      </Stack>
    );
  }

  return (
    <FormProvider {...requestedClassInputFormMethods}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl text-theme-color text-center">
          {t("admin:add_regular_class")}
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col space-y-3 w-full">
          <div className="flex space-x-2">
            <div>
              {t("classes:date")}
              {": "}
              {format(date, "P")}
            </div>
            <div>{t(format(date, "EEEE").toLowerCase())}</div>
          </div>
          <div>
            <SelectClassType />
            {errors.className && (
              <div className="text-sm text-red-600">
                {errors.className.message}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <InputGroup>
              <div className="flex flex-1 space-x-2 items-center">
                <div>{t("from")}:</div>
                <Input
                  type="time"
                  name="startTime"
                  onChange={(e) =>
                    setValue("startTime", e.target.valueAsNumber, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </InputGroup>
            <InputGroup>
              <div className="flex flex-1 space-x-2 items-center">
                <div>{t("to")}:</div>
                <Input
                  type="time"
                  name="endTime"
                  onChange={(e) =>
                    setValue("endTime", e.target.valueAsNumber, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </InputGroup>
            {errors.endTime && (
              <div className="text-sm text-red-600">
                {errors.endTime.message}
              </div>
            )}
            <div>
              {t("duration")}:{" "}
              {t(
                ...(getDuration({
                  startTime: watch("startTime"),
                  endTime: watch("endTime"),
                }) as [string])
              )}
            </div>
          </div>
          {user.admin && (
            <div className="space-y-2">
              <div>
                <SelectCoach />
                {errors.coachId && (
                  <div className="text-sm text-red-600">
                    {errors.coachId.message}
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-2 ">
                <WeekSelectionCheckBox text={t("set_limit")} name="setLimit" />
                <InputGroup>
                  <div
                    className={`flex flex-col w-full space-y-2 ${
                      !watch("setLimit") && "opacity-60"
                    }`}
                  >
                    <div>{t("number_of_people_can_join")}:</div>
                    <Input
                      type="number"
                      name="people"
                      onChange={(e) =>
                        setValue(
                          "people",
                          !isNaN(e.target.valueAsNumber)
                            ? e.target.valueAsNumber
                            : 0,
                          {
                            shouldValidate: true,
                          }
                        )
                      }
                      w="full "
                      disabled={!watch("setLimit")}
                    />
                  </div>
                </InputGroup>
              </div>
            </div>
          )}
          <SubmitButton type="submit" disabled={isLoading || !isValid}>
            {t("common:action.confirm")}
          </SubmitButton>
        </form>
      </div>
    </FormProvider>
  );
};
