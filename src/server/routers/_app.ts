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
import { notificationRouter } from "@/server/routers/notification/notificationRouter";

export const appRouter = router({
  authRouter,
  bookingTimeSlotRouter,
  classRouter,
  lessonClassRouter,
  userRouter,
  newsRouter,
  notificationRouter,
});

export type AppRouter = typeof appRouter;
