import { requestedClassCreateSchema } from "@/schemas/class/requested/create";
import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { format } from "date-fns";

export const update = protectedProcedure
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
        ...hasCoachName,
      },
    });
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
        level: data.level,
        coachId: !!data.coachId ? data.coachId : null,
        numberOfParticipants: setLimit ? people : null,
        regularBookingTimeSlotId,
      },
    });
  });
