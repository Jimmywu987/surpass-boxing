import { editAccountSchema } from "@/schemas/user/edit";
import { zodResolver } from "@hookform/resolvers/zod";

export const useEditAccountInputResolver = () => {
  return zodResolver(editAccountSchema());
};
