import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import { User } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { setLimit, people, ...data } = req.body;
    const user = session?.user as User;
    if (!user.admin) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    let regularBookingTimeSlotId = null;

    const weekday = format(new Date(data.date), "EEEE").toLowerCase();

    let hasCoachName = {};
    if (data.coachName) {
      hasCoachName = {
        coach: {
          username: data.coachName,
        },
      };
    }
    const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst({
      where: {
        [weekday]: true,
        startTime: data.startTime,
        endTime: data.endTime,
        className: data.className,
        ...hasCoachName,
      },
    });
    if (regularBookingSlot) {
      regularBookingTimeSlotId = regularBookingSlot.id;
    }

    const response = await prisma.bookingTimeSlots.update({
      where: {
        id: data.id,
      },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        className: data.className,
        coachName: !!data.coachName ? data.coachName : null,
        numberOfParticipants: setLimit ? people : null,
        regularBookingTimeSlotId,
      },
    });
    return res.status(201).json({ type: response });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
