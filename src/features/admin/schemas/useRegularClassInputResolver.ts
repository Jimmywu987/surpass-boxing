import { regularClassCreateSchema } from "@/schemas/class/regular/create";
import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";

export const useRegularClassInputResolver = () => {
  const { t } = useTranslation("classes");

  return zodResolver(
    regularClassCreateSchema()
      .refine(
        ({ startTime, endTime }) => endTime > startTime,

        {
          message: t("please_select_time_correctly"),
          path: ["endTime"],
        }
      )
      .refine(
        ({ setLimit, people }) =>
          (!setLimit && people === 0) || (setLimit && people && people > 0),
        {
          message: t("please_set_more_than_zero"),
          path: ["people"],
        }
      )
      .refine(
        ({ monday, tuesday, wednesday, thursday, friday, saturday, sunday }) =>
          monday ||
          tuesday ||
          wednesday ||
          thursday ||
          friday ||
          saturday ||
          sunday,
        {
          message: t("please_at_least_select_one_weekday"),
          path: ["sunday"],
        }
      )
  );
};
