/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "@/server/trpc";

import { authRouter } from "@/server/routers/auth/authRouter";
import { bookingTimeSlotRouter } from "@/server/routers/bookingTimeSlot/bookingTimeSlotRouter";
import { classRouter } from "@/server/routers/class/classRouter";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "yay!";
  }),
  authRouter,
  bookingTimeSlotRouter,
  classRouter,
});

export type AppRouter = typeof appRouter;
