import { Select, Skeleton, Stack } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import useTranslation from "next-translate/useTranslation";
import { useFormContext } from "react-hook-form";

export const SelectCoach = () => {
  const { t } = useTranslation("classes");
  const { data } = trpc.userRouter.fetchForAdmin.useQuery();
  const { register } = useFormContext();

  if (!data) {
    return (
      <Stack>
        <Skeleton height="15px" />
      </Stack>
    );
  }
  return (
    <Select placeholder={t("coaches")} {...register("coachId")}>
      {data.users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.username}
        </option>
      ))}
    </Select>
  );
};
