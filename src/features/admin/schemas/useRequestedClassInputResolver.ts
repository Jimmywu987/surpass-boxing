import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";
import { z } from "zod";

export const useRequestedClassInputResolver = (joinedPeopleNum?: number) => {
  const { t } = useTranslation("classes");

  return zodResolver(
    z
      .object({
        id: z.string(),
        date: z.date(),
        startTime: z.number(),
        endTime: z.number(),
        className: z
          .string()
          .min(1, { message: t("please_select_class_type") }),
        setLimit: z.boolean().optional(),
        people: z.number().optional(),
        regularBookingTimeSlotId: z.string().optional(),
        coachName: z.string().optional(),
      })
      .refine(
        ({ startTime, endTime }) => endTime > startTime,

        {
          message: t("please_select_time_correctly"),
          path: ["endTime"],
        }
      )
      .refine(({ setLimit, people }) => !setLimit || (setLimit && people), {
        message: t("please_set_more_than_zero"),
        path: ["people"],
      })
      .refine(
        ({ setLimit, people }) =>
          !setLimit ||
          !joinedPeopleNum ||
          (setLimit && joinedPeopleNum && people && joinedPeopleNum <= people),
        {
          message: t("please_set_less_than_num_joined_people"),
          path: ["people"],
        }
      )
  );
};
