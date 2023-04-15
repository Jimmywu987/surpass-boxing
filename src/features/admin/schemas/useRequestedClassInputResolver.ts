import { requestedClassCreateSchema } from "@/schemas/class/requested/create";
import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";
import { z } from "zod";

export const useRequestedClassInputResolver = (joinedPeopleNum?: number) => {
  const { t } = useTranslation("classes");

  return zodResolver(
    requestedClassCreateSchema()
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
