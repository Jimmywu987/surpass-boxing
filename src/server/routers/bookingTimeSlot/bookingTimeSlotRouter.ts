import { publicProcedure, router, protectedProcedure } from "@/server/trpc";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { TAKE_NUMBER } from "@/constants";
import { prisma } from "@/services/prisma";
import { endOfDay, format, startOfDay, add, parseISO } from "date-fns";
import { z } from "zod";
import {
  getZonedStartOfDay,
  getZonedEndOfDay,
  getTimeZone,
  getFormatTimeZone,
} from "@/helpers/getTimeZone";
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
      const weekday = getFormatTimeZone({
        date: dateTime,
        format: "EEEE",
      }).toLowerCase();
      const startDay = getZonedStartOfDay(dateTime);
      const endDay = getZonedEndOfDay(dateTime);
      try {
        return prisma.$transaction(async (txn) => {
          const whereQuery = {
            gte: startDay,
            lte: endDay,
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

          return {
            totalClassesCount,
            bookingTimeSlots,
            regularBookingSlot,
            dateTime: dateTime,
            weekday,
            startOfDay: startDay,
            endOfDay: endDay,
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
