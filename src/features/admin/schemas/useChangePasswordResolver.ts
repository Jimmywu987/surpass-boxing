import { changePasswordSchema } from "@/schemas/user/changePassword";
import { zodResolver } from "@hookform/resolvers/zod";

export const useChangePasswordResolver = () => {
  return zodResolver(changePasswordSchema);
};
