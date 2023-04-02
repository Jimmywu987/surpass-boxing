import { AdminPeriodOptionsEnum } from "@/features/admin/enums/AdminOptionEnums";
import { prisma } from "@/services/prisma";
import { SortedBookingTimeSlotsType } from "@/types/timeSlots";
import { BookingTimeSlots, BookingTimeSlotStatusEnum } from "@prisma/client";
import {
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";

const getStartDuration = (period: AdminPeriodOptionsEnum) => {
  switch (period) {
    case AdminPeriodOptionsEnum.ONE_DAY:
      return startOfDay;
    case AdminPeriodOptionsEnum.ONE_WEEK:
      return startOfWeek;
    case AdminPeriodOptionsEnum.ONE_MONTH:
      return startOfMonth;
    default:
      return startOfYear;
  }
};

const getEndDuration = (period: AdminPeriodOptionsEnum) => {
  switch (period) {
    case AdminPeriodOptionsEnum.ONE_DAY:
      return endOfDay;
    case AdminPeriodOptionsEnum.ONE_WEEK:
      return endOfWeek;
    case AdminPeriodOptionsEnum.ONE_MONTH:
      return endOfMonth;
    default:
      return endOfYear;
  }
};

const getDurationWhereQuery = ({
  date,
  isPast,
  period,
}: {
  date: string;
  isPast: boolean;
  period: AdminPeriodOptionsEnum;
}) => {
  const dateTime = new Date(date);
  if (!isPast) {
    return {
      gte: startOfDay(dateTime),
    };
  }
  if (period === AdminPeriodOptionsEnum.ALL) {
    return {
      lte: endOfDay(dateTime),
    };
  }
  const yesterday = endOfDay(subDays(new Date(), 1));
  const endDateTime = getEndDuration(period)(dateTime);
  return {
    gte: getStartDuration(period)(dateTime),
    lte: yesterday.getTime() < endDateTime.getTime() ? yesterday : endDateTime,
  };
};

const TAKE_NUMBER = 10;
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(401).json({ errorMessage: "Unauthorized" });
  }
  const { skip, ...dateTimeProps } = req.body;
  try {
    const result = await prisma.$transaction(async (txn) => {
      const whereQuery = getDurationWhereQuery(dateTimeProps);
      const totalClasses = await txn.bookingTimeSlots.aggregate({
        where: {
          date: whereQuery,
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
        },
        where: {
          date: whereQuery,
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
      const date = format(timeSlot.date, "yyyy-MM-dd");
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

    return res.status(201).json({
      ...result,
      bookingTimeSlots: sortedBookingTimeSlots,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: "Something went wrong" });
  }
};

export default handler;
