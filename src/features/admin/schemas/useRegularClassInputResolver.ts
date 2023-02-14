import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";
import { z } from "zod";

export const useRegularClassInputResolver = () => {
  const { t } = useTranslation("classes");

  return zodResolver(
    z
      .object({
        monday: z.boolean(),
        tuesday: z.boolean(),
        wednesday: z.boolean(),
        thursday: z.boolean(),
        friday: z.boolean(),
        saturday: z.boolean(),
        sunday: z.boolean(),
        startTime: z.number(),
        endTime: z.number(),
        className: z
          .string()
          .min(1, { message: t("please_select_class_type") }),
        coachId: z.string().min(1, { message: t("please_select_a_coach") }),
        setLimit: z.boolean().optional(),
        people: z.number().optional(),
      })
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
