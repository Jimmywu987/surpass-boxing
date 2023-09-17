import { Select, Skeleton, Stack } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import useTranslation from "next-translate/useTranslation";
import { useFormContext, FieldValues } from "react-hook-form";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import { useMemo } from "react";

export const SelectClassType = () => {
  const { t } = useTranslation("classes");
  const { data } = trpc.classRouter.fetch.useQuery();
  const session = useSession();
  const user = session.data?.user as User;

  const util = trpc.useContext();

  const lessonData = util.lessonClassRouter.fetch.getData();
  const { setValue } = useFormContext<FieldValues>();

  const lessonLevels = useMemo(() => {
    if (!lessonData) return [];
    return lessonData.lessons.map((lesson) => lesson.level);
  }, [lessonData]);

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
      {data
        .filter((type) => user.admin || lessonLevels.includes(type.level))
        .map((type) => (
          <option key={type.id} value={type.id}>
            {type.name} ({t(type.level.toLowerCase())})
          </option>
        ))}
    </Select>
  );
};
