import { trpc } from "@/utils/trpc";
import { Select, Skeleton, Stack } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { FieldValues, useFormContext } from "react-hook-form";

export const SelectClassType = () => {
  const { t } = useTranslation("classes");
  const { data } = trpc.classRouter.fetch.useQuery();

  const { setValue } = useFormContext<FieldValues>();

  if (!data) {
    return (
      <Stack>
        <Skeleton height="15px" />
      </Stack>
    );
  }
  return (
    <Select
      placeholder={t("class_type")}
      onChange={(event) => {
        const { value } = event.target;
        if (!value) {
          setValue("className", "");
          setValue("level", "", { shouldValidate: true });
          return;
        }
        const selectedClass = data.find((type) => type.id === value);
        if (!selectedClass) return;
        setValue("className", selectedClass.name);
        setValue("level", selectedClass.level, { shouldValidate: true });
      }}
    >
      {data.map((type) => (
        <option key={type.id} value={type.id}>
          {type.name} ({t(type.level.toLowerCase())})
        </option>
      ))}
    </Select>
  );
};
