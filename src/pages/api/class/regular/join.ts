import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import { User } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { id, date } = req.body;
    const user = session?.user as User;

    const regularBookingSlot = await prisma.regularBookingTimeSlots.findFirst({
      where: {
        id,
      },
      include: {
        coach: true,
      },
    });
    if (!regularBookingSlot) {
      return res
        .status(401)
        .json({ errorMessage: "no regular time slot is found." });
    }

    await prisma.bookingTimeSlots.create({
      data: {
        date: new Date(date),
        startTime: regularBookingSlot.startTime,
        endTime: regularBookingSlot.endTime,
        className: regularBookingSlot.className,
        coachName: regularBookingSlot.coach?.username ?? null,
        numberOfParticipants: regularBookingSlot.numberOfParticipants,
        regularBookingTimeSlotId: regularBookingSlot.id,
        userOnBookingTimeSlots: {
          create: {
            userId: user.id,
          },
        },
      },
    });
    return res.status(201).json({ message: "join successfully" });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
