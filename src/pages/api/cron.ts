import { getZonedStartOfDay } from "@/helpers/getTimeZone";
import { prisma } from "@/services/prisma";
import type { NextRequest, NextResponse } from "next/server";

export default async function handler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response(
      "authHeader: " +
        authHeader +
        "feuisfhuufhuishif: " +
        process.env.CRON_SECRET,
      {
        status: 401,
      }
    );
  }
  await prisma.cancelRegularBookingTimeSlot.deleteMany({
    where: {
      date: {
        lt: getZonedStartOfDay(new Date()),
      },
    },
  });
  return Response.json({ success: true });
}
