import { getZonedStartOfDay } from "@/helpers/getTimeZone";
import { prisma } from "@/services/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers["Authorization"] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }
  await prisma.cancelRegularBookingTimeSlot.deleteMany({
    where: {
      date: {
        lt: getZonedStartOfDay(new Date()),
      },
    },
  });
  res.status(200).end("done!");
}
