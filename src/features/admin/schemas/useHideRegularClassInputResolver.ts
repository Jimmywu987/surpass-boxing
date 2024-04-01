import { hideRegularClassSchema } from "@/schemas/class/regular/hide";
import { zodResolver } from "@hookform/resolvers/zod";

export const useHideRegularClassInputResolver = () => {
  return zodResolver(hideRegularClassSchema);
};
