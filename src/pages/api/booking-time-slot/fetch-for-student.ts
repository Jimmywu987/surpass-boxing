import { prisma } from "@/services/prisma";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { format, startOfDay, endOfDay } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";

const getDurationWhereQuery = ({ date }: { date: string }) => {
  const dateTime = new Date(date);
  return {
    gte: startOfDay(dateTime),
    lte: endOfDay(dateTime),
  };
};

const TAKE_NUMBER = 10;
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(401).json({ errorMessage: "Unauthorized" });
  }

  const { skip, date } = req.body;
  const weekday = format(new Date(date), "EEEE").toLowerCase();
  try {
    const result = await prisma.$transaction(async (txn) => {
      const whereQuery = getDurationWhereQuery(date);
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
          bookingTimeSlots: [],
          regularBookingSlot: [],
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
          status: { not: BookingTimeSlotStatusEnum.CANCELED },
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

      const regularBookingSlot = await txn.regularBookingTimeSlots.findMany({
        take: TAKE_NUMBER,
        skip,
        where: {
          [weekday]: true,
          id: { notIn: regularBookingSlotIds },
        },
        include: {
          coach: {
            select: {
              username: true,
            },
          },
        },
      });
      return {
        totalClassesCount,
        bookingTimeSlots,
        regularBookingSlot,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ errorMessage: "Something went wrong" });
  }
};

export default handler;
