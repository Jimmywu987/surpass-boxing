import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const useLoginResolver = () => {
  return zodResolver(
    z.object({
      email: z
        .string({ required_error: "Email Address is required" })
        .email("Incorrect email Address"),
      password: z.string({ required_error: "Password is required" }),
    })
  );
};
