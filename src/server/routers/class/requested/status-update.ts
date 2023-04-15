import { prisma } from "@/services/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import { BookingTimeSlotStatusEnum, Lessons, User } from "@prisma/client";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const { status, id } = req.body;
    const user = session?.user as User;
    if (!user.admin) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    const lessonIds: string[] = [];

    if (status === BookingTimeSlotStatusEnum.CANCELED) {
      const timeSlots = await prisma.userOnBookingTimeSlots.findMany({
        where: {
          bookingTimeSlotId: id,
        },
      });
      const userIds = timeSlots.map((timeSlot) => timeSlot.userId);
      const uniqueLessons: Lessons[] = [];
      const lessons = await prisma.lessons.findMany({
        where: {
          userId: { in: userIds },
          expiryDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          expiryDate: "asc",
        },
      });
      for (const lesson of lessons) {
        const isDuplicate = uniqueLessons.find(
          (each) => each.userId === lesson.userId
        );
        if (!isDuplicate) {
          uniqueLessons.push(lesson);
          lessonIds.push(lesson.id);
        }
      }
    }
    //@TODO: send messages to users
    const response = await prisma.$transaction(async (txn) => {
      if (lessonIds.length > 0) {
        await txn.lessons.updateMany({
          data: {
            lesson: {
              increment: 1,
            },
          },
          where: {
            id: { in: lessonIds },
          },
        });
      }

      return await txn.bookingTimeSlots.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
    });

    return res.status(201).json({ type: response });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
