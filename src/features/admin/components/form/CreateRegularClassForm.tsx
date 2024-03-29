import { useRegularClassInputResolver } from "@/features/admin/schemas/useRegularClassInputResolver";
import { SelectClassType } from "@/features/classes/components/SelectClassType";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { getDuration } from "@/helpers/getDuration";
import { regularClassCreateSchema } from "@/schemas/class/regular/create";
import { trpc } from "@/utils/trpc";
import {
  CheckboxGroup,
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
import { z } from "zod";
import { SelectCoach } from "@/features/admin/components/form/SelectCoach";

import { WeekSelectionCheckBox } from "@/features/admin/components/form/WeekSelectionCheckBox";
import { cn } from "@/utils/cn";

export const CreateRegularClassForm = ({
  modalDisclosure,
}: {
  modalDisclosure: UseDisclosureReturn;
}) => {
  const { t } = useTranslation("classes");
  const utils = trpc.useContext();

  const { data: userData } = trpc.userRouter.fetchForAdmin.useQuery();

  const { mutateAsync, isLoading } =
    trpc.classRouter.regularClassRouter.create.useMutation();

  const { onClose } = modalDisclosure;

  const regularClassInputFormMethods = useForm<
    z.infer<typeof regularClassCreateSchema>
  >({
    resolver: useRegularClassInputResolver(),
    mode: "onChange",
    defaultValues: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      startTime: 0,
      endTime: 0,
      className: "",
      level: ClassLevelEnum.BEGINNER,
      coachId: "",
      setLimit: false,
      people: 0,
    },
  });
  const { setValue, watch, formState } = regularClassInputFormMethods;
  const onSubmit = regularClassInputFormMethods.handleSubmit(async (data) => {
    await mutateAsync(data);
    utils.classRouter.regularClassRouter.fetch.invalidate();
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
    <FormProvider {...regularClassInputFormMethods}>
      <h1 className="text-2xl text-theme-color text-center">
        {t("admin:add_regular_class")}
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col space-y-3 w-full">
        <CheckboxGroup colorScheme="gray">
          <div className="my-2">
            <WeekSelectionCheckBox text={t("monday")} name="monday" />
            <WeekSelectionCheckBox text={t("tuesday")} name="tuesday" />
            <WeekSelectionCheckBox text={t("wednesday")} name="wednesday" />
            <WeekSelectionCheckBox text={t("thursday")} name="thursday" />
            <WeekSelectionCheckBox text={t("friday")} name="friday" />
            <WeekSelectionCheckBox text={t("saturday")} name="saturday" />
            <WeekSelectionCheckBox text={t("sunday")} name="sunday" />
          </div>
          {errors.sunday && (
            <div className="text-sm text-red-600">{errors.sunday.message}</div>
          )}
        </CheckboxGroup>
        <div>
          <SelectClassType />
          {errors.className && (
            <div className="text-sm text-red-600">
              {errors.className.message}
            </div>
          )}
        </div>
        <div>
          <SelectCoach />
          {errors.coachId && (
            <div className="text-sm text-red-600">{errors.coachId.message}</div>
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
            <div className="text-sm text-red-600">{errors.endTime.message}</div>
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
        <div className="flex flex-col space-y-2 ">
          <WeekSelectionCheckBox text={t("set_limit")} name="setLimit" />
          <InputGroup>
            <div
              className={cn(
                "flex flex-col w-full space-y-2 ",
                !watch("setLimit") && "opacity-60"
              )}
            >
              <div>{t("number_of_people_can_join")}:</div>
              <Input
                type="number"
                name="people"
                onChange={(e) =>
                  setValue(
                    "people",
                    isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber,
                    {
                      shouldValidate: true,
                    }
                  )
                }
                w="full"
                disabled={!watch("setLimit")}
              />
            </div>
          </InputGroup>
        </div>
        <SubmitButton type="submit" disabled={isLoading || !isValid}>
          {t("common:action.confirm")}
        </SubmitButton>
      </form>
    </FormProvider>
  );
};
