import { TAKE_NUMBER } from "@/constants";
import { AdminPeriodOptionsEnum } from "@/features/admin/enums/AdminOptionEnums";
import { prisma } from "@/services/prisma";
import { SortedBookingTimeSlotsType } from "@/types/timeSlots";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { endOfDay, format, isAfter, startOfDay, subDays } from "date-fns";

import {
  getFormatTimeZone,
  getZonedEndOfDay,
  getZonedEndOfMonth,
  getZonedEndOfWeek,
  getZonedEndOfYear,
  getZonedStartOfDay,
  getZonedStartOfMonth,
  getZonedStartOfWeek,
  getZonedStartOfYear,
} from "@/helpers/getTimeZone";
import { publicProcedure } from "@/server/trpc";
import { z } from "zod";
const getStartDuration = (period: AdminPeriodOptionsEnum) => {
  switch (period) {
    case AdminPeriodOptionsEnum.ONE_DAY:
      return getZonedStartOfDay;
    case AdminPeriodOptionsEnum.ONE_WEEK:
      return getZonedStartOfWeek;
    case AdminPeriodOptionsEnum.ONE_MONTH:
      return getZonedStartOfMonth;
    default:
      return getZonedStartOfYear;
  }
};

const getEndDuration = (period: AdminPeriodOptionsEnum) => {
  switch (period) {
    case AdminPeriodOptionsEnum.ONE_DAY:
      return getZonedEndOfDay;
    case AdminPeriodOptionsEnum.ONE_WEEK:
      return getZonedEndOfWeek;
    case AdminPeriodOptionsEnum.ONE_MONTH:
      return getZonedEndOfMonth;
    default:
      return getZonedEndOfYear;
  }
};

const getDurationWhereQuery = ({
  date,
  isPast,
  period,
}: {
  date: string;
  isPast: boolean;
  period: AdminPeriodOptionsEnum | null;
}) => {
  const dateTime = new Date(date);
  if (!isPast || !period) {
    return {
      gte: getZonedStartOfDay(dateTime),
    };
  }
  if (period === AdminPeriodOptionsEnum.ALL) {
    return {
      lte: getZonedEndOfDay(dateTime),
    };
  }
  const yesterday = getZonedEndOfDay(subDays(new Date(), 1));
  const endDateTime = getEndDuration(period)(dateTime);
  return {
    gte: getStartDuration(period)(dateTime),
    lte: isAfter(endDateTime.getTime(), yesterday.getTime())
      ? yesterday
      : endDateTime,
  };
};
const fetchInput = z.object({
  skip: z.number(),
  date: z.string(),
  isPast: z.boolean(),
  period: z
    .enum([
      AdminPeriodOptionsEnum.ALL,
      AdminPeriodOptionsEnum.ONE_DAY,
      AdminPeriodOptionsEnum.ONE_WEEK,
      AdminPeriodOptionsEnum.ONE_MONTH,
      AdminPeriodOptionsEnum.ONE_YEAR,
    ])
    .nullable(),
  timeSlotId: z.string().optional(),
});
export const fetch = publicProcedure
  .input(fetchInput)
  .query(async ({ input }) => {
    const { skip, timeSlotId, ...dateTimeProps } = input;
    try {
      const result = await prisma.$transaction(async (txn) => {
        const whereQuery = getDurationWhereQuery(
          dateTimeProps as Omit<z.infer<typeof fetchInput>, "skip"> & {
            period: AdminPeriodOptionsEnum;
          }
        );
        const specificTimeSlot = timeSlotId
          ? { OR: [{ id: timeSlotId }] }
          : undefined;
        const totalClasses = await txn.bookingTimeSlots.aggregate({
          where: {
            date: whereQuery,
            ...specificTimeSlot,
          },
          _count: true,
        });
        const totalClassesCount = totalClasses._count;
        if (totalClassesCount === 0) {
          return {
            totalClassesCount: 0,
            totalConfirmedClasses: 0,
            totalCanceledClasses: 0,
            bookingTimeSlots: [],
          };
        }
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
            ...specificTimeSlot,
          },
          orderBy: {
            date: "desc",
          },
        });
        const totalConfirmedClasses = await txn.bookingTimeSlots.aggregate({
          where: {
            date: whereQuery,
            status: BookingTimeSlotStatusEnum.CONFIRM,
          },
          _count: true,
        });
        const totalCanceledClasses = await txn.bookingTimeSlots.aggregate({
          where: {
            date: whereQuery,
            status: BookingTimeSlotStatusEnum.CANCELED,
          },
          _count: true,
        });
        return {
          bookingTimeSlots,
          totalClassesCount,
          totalConfirmedClasses: totalConfirmedClasses._count,
          totalCanceledClasses: totalCanceledClasses._count,
        };
      });

      const sortedBookingTimeSlots: SortedBookingTimeSlotsType = [];

      result.bookingTimeSlots.map((timeSlot) => {
        const date = getFormatTimeZone({
          date: timeSlot.date,
        });
        const checkIfExist = sortedBookingTimeSlots.findIndex(
          (slot) => slot.date === date
        );
        if (checkIfExist !== -1) {
          sortedBookingTimeSlots[checkIfExist].timeSlots.push(timeSlot);
          return;
        }
        sortedBookingTimeSlots.push({
          date,
          timeSlots: [timeSlot],
        });
      });

      return {
        ...result,
        bookingTimeSlots: sortedBookingTimeSlots,
      };
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Something went wrong",
      });
    }
  });
