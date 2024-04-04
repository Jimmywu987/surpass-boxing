import { TAKE_NUMBER } from "@/constants";
import { getFormatTimeZone, getZonedStartOfDay } from "@/helpers/getTimeZone";
import { publicProcedure, router } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { SortedTimeSlotsType, TimeSlotsType } from "@/types";
import { TRPCError } from "@trpc/server";
import { add, addWeeks, differenceInDays } from "date-fns";
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

      const startDay = getZonedStartOfDay(dateTime);
      const endDay = addWeeks(startDay, 1);

      try {
        const result = await prisma.$transaction(
          async (txn) => {
            const whereQuery = {
              gte: startDay,
              lte: endDay,
            };
            const dayOffs = await txn.offDay.findMany({
              where: {
                date: whereQuery,
              },
            });

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

            const regularBookingSlot =
              await txn.regularBookingTimeSlots.findMany({
                take: TAKE_NUMBER,
                skip,
                include: {
                  coach: {
                    select: {
                      username: true,
                    },
                  },
                  cancelRegularBookingTimeSlot: {
                    where: {
                      date: whereQuery,
                    },
                  },
                },
              });

            return {
              bookingTimeSlots,
              regularBookingSlot,
              dayOffs,
            };
          },
          {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
          }
        );
        const sortedBookingTimeSlots: SortedTimeSlotsType = {};

        for (let i = 0; i < result.bookingTimeSlots.length; i++) {
          const timeSlot = result.bookingTimeSlots[i];
          const date = getFormatTimeZone({
            date: timeSlot.date,
          });

          if (!sortedBookingTimeSlots[date]) {
            sortedBookingTimeSlots[date] = {
              number: differenceInDays(timeSlot.date, startDay),
              isDayOff: false,
              dayOffReasons: null,
              date,
              timeSlots: [timeSlot],
            };
            continue;
          }

          sortedBookingTimeSlots[date].timeSlots.push(timeSlot);
        }

        const weeks: {
          [key: string]: { day: Date; date: string; weekDay: string };
        } = {};

        for (let x = 0; x < 7; x++) {
          const day = add(startDay, { days: x });
          const weekDay = getFormatTimeZone({
            date: day,
            format: "EEEE",
          }).toLowerCase();
          const date = getFormatTimeZone({
            date: day,
          });

          weeks[x.toString()] = {
            day,
            date,
            weekDay,
          };
        }

        for (let a = 0; a < result.dayOffs.length; a++) {
          const dayOff = result.dayOffs[a];
          const date = getFormatTimeZone({
            date: dayOff.date,
          });

          sortedBookingTimeSlots[date] = {
            number: differenceInDays(dayOff.date, startDay),
            isDayOff: true,
            dayOffReasons: dayOff.reason,
            timeSlots: [],
            date,
          };
        }

        for (let i = 0; i < result.regularBookingSlot.length; i++) {
          const regularSlot = result.regularBookingSlot[i];
          for (let x = 0; x < 7; x++) {
            const each = weeks[x];
            const { cancelRegularBookingTimeSlot } = regularSlot;
            const hideDates = cancelRegularBookingTimeSlot.map(({ date }) => {
              return getFormatTimeZone({
                date,
              });
            });

            if (
              !hideDates.includes(each.date) &&
              regularSlot[each.weekDay as "monday"]
            ) {
              if (sortedBookingTimeSlots[each.date]) {
                const existingSlots = sortedBookingTimeSlots[each.date];
                const shouldInclude =
                  existingSlots.timeSlots.findIndex(
                    (slot) => slot.regularBookingTimeSlotId === regularSlot.id
                  ) === -1;
                if (shouldInclude) {
                  sortedBookingTimeSlots[each.date].timeSlots.push({
                    ...regularSlot,
                    date: each.day,
                    userOnBookingTimeSlots: [],
                    numberOfParticipants: 0,
                    regularBookingTimeSlotId: null,
                  } as TimeSlotsType);
                }
              } else {
                sortedBookingTimeSlots[each.date] = {
                  number: differenceInDays(each.day, startDay),
                  isDayOff: false,
                  dayOffReasons: null,
                  date: each.date,
                  timeSlots: [
                    {
                      ...regularSlot,
                      date: each.day,
                      userOnBookingTimeSlots: [],
                      numberOfParticipants: 0,
                      regularBookingTimeSlotId: null,
                    } as TimeSlotsType,
                  ],
                };
              }
            }
          }
        }

        return {
          ...result,
          sortedBookingTimeSlots,
        };
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
});
