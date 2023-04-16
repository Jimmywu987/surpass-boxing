import { addLessonSchema } from "@/schemas/lesson/add";
import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";

export const useAddClassInputResolver = () => {
  const { t } = useTranslation("classes");

  return zodResolver(addLessonSchema());
};
