import { publicProcedure, router } from "@/server/trpc";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { TAKE_NUMBER } from "@/constants";
import { prisma } from "@/services/prisma";
import { endOfDay, format, startOfDay } from "date-fns";
import { z } from "zod";

export const bookingTimeSlotRouter = router({
  fetchForStudent: publicProcedure
    .input(
      z.object({
        skip: z.number(),
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { skip, date } = input;
      const dateTime = new Date(date);
      const weekday = format(dateTime, "EEEE").toLowerCase();

      try {
        return prisma.$transaction(async (txn) => {
          const whereQuery = {
            gte: startOfDay(dateTime),
            lte: endOfDay(dateTime),
          };

          const totalClasses = await txn.bookingTimeSlots.aggregate({
            where: {
              date: whereQuery,
              status: { not: BookingTimeSlotStatusEnum.CANCELED },
            },
            _count: true,
          });
          const totalClassesCount = totalClasses._count;

          const bookingTimeSlots = await txn.bookingTimeSlots.findMany({
            take: TAKE_NUMBER,
            skip,
            include: {
              userOnBookingTimeSlots: {
                include: {
                  user: {
                    select: {
                      username: true,
                      profileImg: true,
                    },
                  },
                },
              },
            },
            where: {
              date: whereQuery,
            },
            orderBy: {
              date: "desc",
            },
          });
          const regularBookingSlotIds =
            bookingTimeSlots.length > 0
              ? (bookingTimeSlots
                  .map((slot) => slot.regularBookingTimeSlotId)
                  .filter((id) => id) as string[])
              : [];

          const regularBookingSlot = await txn.regularBookingTimeSlots.findMany(
            {
              take: TAKE_NUMBER,
              skip,
              where: {
                [weekday]: true,
                id: {
                  not: {
                    in: regularBookingSlotIds,
                  },
                },
              },
              include: {
                coach: {
                  select: {
                    username: true,
                  },
                },
              },
            }
          );
          return {
            totalClassesCount,
            bookingTimeSlots,
            regularBookingSlot,
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }
    }),
  fetch: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      const { ids } = input;
      try {
        return prisma.bookingTimeSlots.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          orderBy: {
            date: "desc",
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }
    }),
});