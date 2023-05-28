import { useSetOffDayInputResolver } from "@/features/admin/schemas/useSetOffDayInputResolver";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { DatePicker } from "@/features/common/components/DatePicker";
import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import { addOffDaySchema } from "@/schemas/offDay/add";
import { trpc } from "@/utils/trpc";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { endOfDay, format, subDays } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export const SetOffDayForm = ({
  modalDisclosure,
}: {
  modalDisclosure: UseDisclosureReturn;
}) => {
  const { t } = useTranslation("admin");

  const utils = trpc.useContext();

  const { onClose } = modalDisclosure;
  const setDayOffInputFormMethods = useForm<z.infer<typeof addOffDaySchema>>({
    resolver: useSetOffDayInputResolver(),
    mode: "onChange",
    defaultValues: {
      reason: "",
      date: new Date().toString(),
    },
  });
  const { mutateAsync, isLoading } = trpc.offDayRouter.add.useMutation({
    onSuccess: () => {
      setDayOffInputFormMethods.reset();
      utils.offDayRouter.fetch.invalidate();
      onClose();
    },
  });

  const { setValue, formState, getValues } = setDayOffInputFormMethods;

  const onSubmit = setDayOffInputFormMethods.handleSubmit(async (data) => {
    await mutateAsync(data);
  });
  const pickedDate = getValues("date");
  return (
    <FormProvider {...setDayOffInputFormMethods}>
      <form className="flex flex-col space-y-3" onSubmit={onSubmit}>
        <h1 className="text-2xl text-theme-color text-center">
          {t("add_day_off")}
        </h1>
        <div className="space-y-1">
          <label className="text-gray-700">{t("off_day")}:</label>
          <div className="flex space-x-2 items-center">
            <div className="w-46">
              <DatePicker
                datePickerProps={{
                  date: new Date(pickedDate),
                  onDateChange: (value) => {
                    setValue("date", value.toString(), {
                      shouldValidate: true,
                    });
                  },
                  minDate: endOfDay(subDays(new Date(), 1)),
                  propsConfigs: {
                    inputProps: {
                      color: "teal.800",
                    },
                  },
                }}
              />
            </div>
            <div className="text-gray-700">
              {t(
                `classes:${format(new Date(pickedDate), "EEEE").toLowerCase()}`
              )}
            </div>
          </div>
        </div>
        <FormTextInput type="text" name="reason" label={t("reason")} />

        <SubmitButton type="submit" disabled={isLoading || !formState.isValid}>
          {t("common:action.confirm")}
        </SubmitButton>
      </form>
    </FormProvider>
  );
};
