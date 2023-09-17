import { TAKE_NUMBER } from "@/constants";
import { prisma } from "@/services/prisma";
import { SortedBookingTimeSlotsType } from "@/types";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { getFormatTimeZone } from "@/helpers/getTimeZone";
import { publicProcedure } from "@/server/trpc";
import { z } from "zod";

export const fetchConfirmedClasses = publicProcedure
  .input(
    z.object({
      skip: z.number(),
    })
  )
  .query(async ({ input }) => {
    const { skip } = input;
    try {
      const result = await prisma.$transaction(async (txn) => {
        const totalConfirmedClasses = await txn.bookingTimeSlots.aggregate({
          where: {
            status: BookingTimeSlotStatusEnum.CONFIRM,
          },
          _count: true,
        });
        const totalConfirmedClassesCount = totalConfirmedClasses._count;
        if (totalConfirmedClassesCount === 0) {
          return {
            totalConfirmedClassesCount: 0,
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
            status: BookingTimeSlotStatusEnum.CONFIRM,
          },
          orderBy: {
            date: "desc",
          },
        });

        return {
          bookingTimeSlots,
          totalConfirmedClassesCount,
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
