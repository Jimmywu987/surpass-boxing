import { addLessonSchema } from "@/schemas/lesson/add";
import { zodResolver } from "@hookform/resolvers/zod";

export const useAddClassInputResolver = () => {
  return zodResolver(addLessonSchema);
};
