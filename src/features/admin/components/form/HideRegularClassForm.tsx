import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { DatePicker } from "@/features/common/components/DatePicker";

import { hideRegularClassSchema } from "@/schemas/class/regular/hide";

import { trpc } from "@/utils/trpc";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { endOfDay, format, subDays } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useHideRegularClassInputResolver } from "@/features/admin/schemas/useHideRegularClassInputResolver";

export const HideRegularClassForm = ({
  modalDisclosure,
  timeSlotId,
}: {
  modalDisclosure: UseDisclosureReturn;
  timeSlotId: string;
}) => {
  const { t } = useTranslation("admin");

  const utils = trpc.useContext();

  const { onClose } = modalDisclosure;
  const hideRegularClassFormMethods = useForm<
    z.infer<typeof hideRegularClassSchema>
  >({
    resolver: useHideRegularClassInputResolver(),
    mode: "onChange",
    defaultValues: {
      date: new Date().toString(),
      timeSlotId,
    },
  });

  const { mutateAsync, isLoading } =
    trpc.classRouter.regularClassRouter.hide.useMutation({
      onSuccess: () => {
        hideRegularClassFormMethods.reset();
        utils.classRouter.regularClassRouter.fetch.invalidate();
        onClose();
      },
    });

  const { setValue, formState, getValues } = hideRegularClassFormMethods;

  const onSubmit = hideRegularClassFormMethods.handleSubmit(async (data) => {
    await mutateAsync(data);
  });
  const pickedDate = getValues("date");
  return (
    <FormProvider {...hideRegularClassFormMethods}>
      <form className="flex flex-col space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-gray-700">
            {t("remove_regular_class_on_specific_date")}:
          </label>
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

        <SubmitButton type="submit" disabled={isLoading || !formState.isValid}>
          {t("common:action.confirm")}
        </SubmitButton>
      </form>
    </FormProvider>
  );
};
