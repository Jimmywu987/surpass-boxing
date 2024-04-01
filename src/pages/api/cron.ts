import { getZonedStartOfDay } from "@/helpers/getTimeZone";
import { prisma } from "@/services/prisma";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const authHeader = request.headers["authorization"];
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return response.status(401).json({ success: false });
  }
  const past = getZonedStartOfDay(new Date());
  await prisma.cancelRegularBookingTimeSlot.deleteMany({
    where: {
      date: {
        lt: past,
      },
    },
  });
  await prisma.offDay.deleteMany({
    where: {
      date: {
        lt: past,
      },
    },
  });
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
  return response.status(200).end("done!");
}
