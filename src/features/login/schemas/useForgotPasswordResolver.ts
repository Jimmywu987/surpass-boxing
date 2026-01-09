import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas/auth/forgotPassword";

export const useForgotPasswordResolver = () => {
  return zodResolver(forgotPasswordSchema);
};
