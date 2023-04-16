/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "@/server/trpc";

import { authRouter } from "@/server/routers/auth/authRouter";
import { bookingTimeSlotRouter } from "@/server/routers/bookingTimeSlot/bookingTimeSlotRouter";
import { classRouter } from "@/server/routers/class/classRouter";
import { lessonClassRouter } from "@/server/routers/lesson/lessonClassRouter";
import { userRouter } from "@/server/routers/users/userRouter";
import { newsRouter } from "@/server/routers/news/newsRouter";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "yay!";
  }),
  authRouter,
  bookingTimeSlotRouter,
  classRouter,
  lessonClassRouter,
  userRouter,
  newsRouter,
});

export type AppRouter = typeof appRouter;
