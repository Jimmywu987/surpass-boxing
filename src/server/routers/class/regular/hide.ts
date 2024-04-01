import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { TRPCError } from "@trpc/server";

import { User } from "@prisma/client";

import { hideRegularClassSchema } from "@/schemas/class/regular/hide";

export const hide = protectedProcedure
  .input(hideRegularClassSchema)
  .mutation(async ({ ctx, input }) => {
    const { timeSlotId, date } = input;
    const user = ctx.session?.user as User;
    const { admin } = user;
    if (!admin) {
      throw new TRPCError({
        code: "BAD_REQUEST",
      });
    }
    return prisma.cancelRegularBookingTimeSlot.create({
      data: {
        regularBookingTimeSlotId: timeSlotId,
        date: new Date(date),
      },
    });
  });
