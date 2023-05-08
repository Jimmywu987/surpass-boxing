import { requestedClassCreateSchema } from "@/schemas/class/requested/create";
import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { Lessons, User } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";

export const create = protectedProcedure
  .input(requestedClassCreateSchema())
  .mutation(async ({ ctx, input }) => {
    const { setLimit, people, date, ...data } = input as z.infer<
      ReturnType<typeof requestedClassCreateSchema>
    >;
    const dateTime = new Date(date);
    const user = ctx.session.user as User;
    let lessons: Lessons[] = [];
    if (!user.admin) {
      lessons = await prisma.lessons.findMany({
        where: {
          userId: user.id,
          expiryDate: {
            gte: new Date(),
          },
          lesson: {
            gt: 0,
          },
        },
        orderBy: {
          expiryDate: "asc",
        },
      });
      if (lessons.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You don't have any lessons left",
        });
      }
    }
    let regularBookingTimeSlotId: string | null = null;

    const weekday = format(dateTime, "EEEE").toLowerCase();

    let hasCoachName = {};
    if (data.coachId) {
      hasCoachName = {
        coach: {
          id: data.coachId,
        },
      };
    }
    const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst({
      where: {
        [weekday]: true,
        startTime: data.startTime,
        endTime: data.endTime,
        className: data.className,
        level: data.level,
        ...hasCoachName,
      },
    });
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
    return await prisma.$transaction(async (txn) => {
      if (!user.admin) {
        await txn.lessons.update({
          data: {
            lesson: {
              decrement: 1,
            },
          },
          where: {
            id: lessons[0].id,
          },
        });
      }

      return txn.bookingTimeSlots.create({
        data: {
          ...data,
          date: dateTime,
          coachId: !!data.id ? data.id : null,
          numberOfParticipants: setLimit ? people : null,
          regularBookingTimeSlotId,
          ...addOneUserToClass,
        },
      });
    });
  });
