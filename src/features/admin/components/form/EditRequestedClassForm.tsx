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
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";
import { FormProvider, useForm } from "react-hook-form";
import { SelectCoach } from "@/features/admin/components/form/SelectCoach";

import { useRequestedClassInputResolver } from "@/features/admin/schemas/useRequestedClassInputResolver";
import { format, intervalToDuration } from "date-fns";
import { WeekSelectionCheckBox } from "./WeekSelectionCheckBox";
import { TimeSlotsType } from "@/types/timeSlots";
import { getTimeDisplay } from "@/helpers/getTime";
import { requestedClassCreateSchema } from "@/schemas/class/requested/create";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import { SelectClassType } from "@/features/classes/components/SelectClassType";

export const EditRequestedClassForm = ({
  modalDisclosure,
  timeSlot,
}: {
  modalDisclosure: UseDisclosureReturn;
  timeSlot: TimeSlotsType;
}) => {
  const { t } = useTranslation("classes");
  const utils = trpc.useContext();
  const { classRouter } = trpc;

  const { data: userData } = trpc.userRouter.fetchForAdmin.useQuery();

  const session = useSession();
  const user = session.data?.user as User;
  const { mutateAsync, isLoading } =
    classRouter.requestedClassRouter.update.useMutation();

  const { onClose } = modalDisclosure;

  const requestedClassInputFormMethods = useForm<
    z.infer<ReturnType<typeof requestedClassCreateSchema>>
  >({
    resolver: useRequestedClassInputResolver(
      timeSlot.userOnBookingTimeSlots.length
    ),
    mode: "onSubmit",
    defaultValues: {
      id: timeSlot.id,
      date: timeSlot.date.toString(),
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      className: timeSlot.className,
      level: timeSlot.level,
      setLimit: timeSlot.numberOfParticipants ? true : false,
      people: timeSlot.numberOfParticipants ?? 0,
      coachId: timeSlot.coachId ?? "",
    },
  });

  const { setValue, watch, formState } = requestedClassInputFormMethods;

  const onSubmit = requestedClassInputFormMethods.handleSubmit(async (data) => {
    await mutateAsync(data);
    utils.classRouter.requestedClassRouter.fetch.invalidate();
    onClose();
  });
  const { errors } = formState;
  if (isLoading || !userData) {
    return (
      <Stack mt="12">
        <Skeleton height="350px" />
      </Stack>
    );
  }

  const defaultFromTime = intervalToDuration({
    start: timeSlot.startTime,
    end: 0,
  });
  const defaultToTime = intervalToDuration({ start: timeSlot.endTime, end: 0 });
  return (
    <FormProvider {...requestedClassInputFormMethods}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl text-theme-color text-center">
          {t("admin:edit_requested_class")}
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col space-y-3 w-full">
          <div className="flex space-x-2">
            <div>
              {t("classes:date")}
              {": "}
              {format(new Date(timeSlot.date), "P")}
            </div>
            <div>
              {t(format(new Date(timeSlot.date), "EEEE").toLowerCase())}
            </div>
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
                  defaultValue={
                    defaultFromTime
                      ? getTimeDisplay(
                          defaultFromTime.hours,
                          defaultFromTime.minutes
                        )
                      : "00:00"
                  }
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
                  defaultValue={
                    defaultToTime
                      ? getTimeDisplay(
                          defaultToTime.hours,
                          defaultToTime.minutes
                        )
                      : "00:00"
                  }
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
                        isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber,
                        {
                          shouldValidate: true,
                        }
                      )
                    }
                    w="full"
                    defaultValue={
                      watch("setLimit")
                        ? timeSlot.numberOfParticipants ?? undefined
                        : undefined
                    }
                    disabled={!watch("setLimit")}
                  />
                </div>
              </InputGroup>
              <div>
                {t("number_of_people_already_joined")}:{" "}
                {timeSlot.userOnBookingTimeSlots.length}
              </div>
            </div>
          </div>
          <SubmitButton type="submit" disabled={isLoading}>
            {t("common:action.confirm")}
          </SubmitButton>
        </form>
      </div>
    </FormProvider>
  );
};
