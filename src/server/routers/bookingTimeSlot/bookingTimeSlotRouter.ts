import { publicProcedure, router, protectedProcedure } from "@/server/trpc";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { TAKE_NUMBER } from "@/constants";
import { prisma } from "@/services/prisma";
import { endOfDay, format, startOfDay, add, parseISO } from "date-fns";
import { z } from "zod";
import { getZonedStartOfDay, getZonedEndOfDay } from "@/helpers/getTimeZone";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

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
            gte: getZonedStartOfDay(dateTime),
            lte: getZonedEndOfDay(dateTime),
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
              coach: {
                select: {
                  username: true,
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
          const input = new Date(date);

          // UTC: 09-27 21:00
          // Browser (Germany/Berlin): 09-26 23:00
          const inputZoned = utcToZonedTime(input, "Asia/Hong_Kong");

          // UTC: 09-25 22:00
          // Browser (Germany/Berlin): 09-26 00:00
          const dayStartZoned = startOfDay(inputZoned);
          const dayEndZoned = endOfDay(inputZoned);

          // UTC: 09-26 04:00
          // Browser (Germany/Berlin): 09-26 06:00
          // Target (America/New_York): 09-26 00:00
          const dayStart = zonedTimeToUtc(dayStartZoned, "Asia/Hong_Kong");
          const dayEnd = zonedTimeToUtc(dayEndZoned, "Asia/Hong_Kong");
          return {
            totalClassesCount,
            bookingTimeSlots,
            regularBookingSlot,
            dateTime: inputZoned,
            startOfDay: dayStart,
            endOfDay: dayEnd,
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
          include: {
            coach: {
              select: {
                username: true,
              },
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
  remove: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session?.user as User;
    if (!user.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    await prisma.bookingTimeSlots.deleteMany({
      where: {
        date: {
          lt: new Date(),
        },
        status: BookingTimeSlotStatusEnum.PENDING,
        userOnBookingTimeSlots: {
          every: {
            userId: {
              in: [],
            },
          },
        },
      },
    });
  }),
});
