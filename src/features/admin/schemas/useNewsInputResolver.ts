import { addNewsSchema } from "@/schemas/news/add";
import { zodResolver } from "@hookform/resolvers/zod";

export const useNewsInputResolver = () => {
  return zodResolver(addNewsSchema());
};
