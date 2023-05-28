import { addOffDaySchema } from "@/schemas/offDay/add";
import { zodResolver } from "@hookform/resolvers/zod";

export const useSetOffDayInputResolver = () => {
  return zodResolver(addOffDaySchema);
};
