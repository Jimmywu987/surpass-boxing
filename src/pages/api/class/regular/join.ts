import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/services/prisma";

import { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

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
    const lessons = await prisma.lessons.findMany({
      where: {
        userId: user.id,
        expiryDate: {
          gte: new Date(),
        },
        lesson: {
          gt: 0,
        },
      },
    });

    if (lessons.length === 0) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
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
