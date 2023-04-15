import { requestedClassCreateSchema } from "@/schemas/class/requested/create";
import { router, protectedProcedure, publicProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";
import { z } from "zod";

export const requestedClassRouter = router({
  create: protectedProcedure
    .input(requestedClassCreateSchema())
    .mutation(async ({ ctx, input }) => {
      const { setLimit, people, date, ...data } = input as z.infer<
        ReturnType<typeof requestedClassCreateSchema>
      >;
      const dateTime = new Date(date);
      const user = ctx.session.user as User;
      if (!user.admin) {
        const lessons = await prisma.lessons.findFirst({
          where: {
            userId: user.id,
            expiryDate: { gte: new Date() },
            lesson: {
              gt: 0,
            },
          },
        });
        if (!lessons) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You don't have any lessons left",
          });
        }
      }
      let regularBookingTimeSlotId = null;

      const weekday = format(dateTime, "EEEE").toLowerCase();

      let hasCoachName = {};
      if (data.coachName) {
        hasCoachName = {
          coach: {
            username: data.coachName,
          },
        };
      }
      const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst(
        {
          where: {
            [weekday]: true,
            startTime: data.startTime,
            endTime: data.endTime,
            className: data.className,
            ...hasCoachName,
          },
        }
      );
      if (regularBookingSlot) {
        regularBookingTimeSlotId = regularBookingSlot.id;
      }

      let addOneUserToClass = {};
      if (!user.admin) {
        addOneUserToClass = {
          userOnBookingTimeSlots: {
            create: {
              userId: user.id,
            },
          },
        };
      }
      return prisma.bookingTimeSlots.create({
        data: {
          ...data,
          date: dateTime,
          coachName: !!data.coachName ? data.coachName : null,
          numberOfParticipants: setLimit ? people : null,
          regularBookingTimeSlotId,
          ...addOneUserToClass,
        },
      });
    }),
  update: protectedProcedure
    .input(requestedClassCreateSchema())
    .mutation(async ({ ctx, input }) => {
      const { setLimit, people, date, ...data } = input;
      const dateTime = new Date(date);
      const user = ctx.session?.user as User;
      if (!user.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      let regularBookingTimeSlotId = null;

      const weekday = format(dateTime, "EEEE").toLowerCase();

      let hasCoachName = {};
      if (data.coachName) {
        hasCoachName = {
          coach: {
            username: data.coachName,
          },
        };
      }
      const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst(
        {
          where: {
            [weekday]: true,
            startTime: data.startTime,
            endTime: data.endTime,
            className: data.className,
            ...hasCoachName,
          },
        }
      );
      if (regularBookingSlot) {
        regularBookingTimeSlotId = regularBookingSlot.id;
      }

      return prisma.bookingTimeSlots.update({
        where: {
          id: data.id,
        },
        data: {
          date: dateTime,
          startTime: data.startTime,
          endTime: data.endTime,
          className: data.className,
          coachName: !!data.coachName ? data.coachName : null,
          numberOfParticipants: setLimit ? people : null,
          regularBookingTimeSlotId,
        },
      });
    }),
});
