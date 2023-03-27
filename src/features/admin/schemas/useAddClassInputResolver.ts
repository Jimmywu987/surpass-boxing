import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";
import { z } from "zod";

export const useAddClassInputResolver = () => {
  const { t } = useTranslation("classes");

  return zodResolver(
    z.object({
      lesson: z.number().positive(),
      durationUnit: z.string(),
      duration: z.number().positive(),
    })
  );
};
