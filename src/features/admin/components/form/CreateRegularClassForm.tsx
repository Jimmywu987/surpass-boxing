import {
  useClassTypeQuery,
  useCreateRegularClassMutation,
  useUsersQuery,
} from "@/apis/api";
import { useRegularClassInputResolver } from "@/features/admin/schemas/useRegularClassInputResolver";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { getDuration } from "@/helpers/getDuration";
import {
  CheckboxGroup,
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
import { useQueryClient } from "react-query";
import { WeekSelectionCheckBox } from "./WeekSelectionCheckBox";
type CreateRegularClassInputType = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  startTime: number;
  endTime: number;
  coachId: string;
  className: string;
  people: number;
  setLimit: boolean;
};
export const CreateRegularClassForm = ({
  modalDisclosure,
}: {
  modalDisclosure: UseDisclosureReturn;
}) => {
  const { t } = useTranslation("classes");
  const { data } = useClassTypeQuery();
  const { data: userData } = useUsersQuery(true, {});
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useCreateRegularClassMutation();
  const session = useSession();
  const user = session.data?.user as User;

  const { onClose } = modalDisclosure;

  const regularClassInputFormMethods = useForm<CreateRegularClassInputType>({
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
      coachId: "",
      setLimit: false,
      people: 0,
    },
  });
  const { setValue, watch, formState, register } = regularClassInputFormMethods;
  const onSubmit = regularClassInputFormMethods.handleSubmit(async (data) => {
    await mutateAsync(data);
    await queryClient.invalidateQueries("regularClass");
    onClose();
  });
  const { errors, isValid } = formState;
  if (!data || isLoading || !userData) {
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
          <Select placeholder={t("class_type")} {...register("className")}>
            {data.classTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </Select>
          {errors.className && (
            <div className="text-sm text-red-600">
              {errors.className.message}
            </div>
          )}
        </div>
        <div>
          <Select placeholder={t("coaches")} {...register("coachId")}>
            {userData.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </Select>
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
              className={`flex flex-col w-full space-y-2 ${
                !watch("setLimit") && "opacity-60"
              }`}
            >
              <div>{t("number_of_people_can_join")}:</div>
              <Input
                type="number"
                name="people"
                onChange={(e) =>
                  setValue("people", e.target.valueAsNumber, {
                    shouldValidate: true,
                  })
                }
                w="full "
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
