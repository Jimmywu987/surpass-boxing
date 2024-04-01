import { getZonedStartOfDay } from "@/helpers/getTimeZone";
import { prisma } from "@/services/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: any, response: NextApiResponse) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return response.status(401).json({ success: false });
  }

  await prisma.cancelRegularBookingTimeSlot.deleteMany({
    where: {
      date: {
        lt: getZonedStartOfDay(new Date()),
      },
    },
  });
  response.status(200).end("done!");
}
