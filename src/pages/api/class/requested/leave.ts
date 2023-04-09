import { prisma } from "@/services/prisma";
import { Lessons, User } from "@prisma/client";
import { add, isAfter } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { id, isConfirm } = req.body;
    const user = session?.user as User & { lessons: Lessons[] };
    if (isConfirm) {
      const bookingTimeSlot = await prisma.userOnBookingTimeSlots.findUnique({
        where: {
          userId_bookingTimeSlotId: {
            userId: user.id,
            bookingTimeSlotId: id,
          },
        },
      });
      if (!bookingTimeSlot) {
        return res.status(401).json({ errorMessage: "Unauthorized" });
      }
      const joiningTime = new Date(bookingTimeSlot.createdAt);
      const now = new Date();

      if (isAfter(add(joiningTime, { hours: 1 }), now)) {
        const lesson = await user.lessons.find((lesson) =>
          isAfter(new Date(lesson.expiryDate), new Date())
        );
        if (lesson) {
          await prisma.lessons.update({
            data: {
              lesson: {
                increment: 1,
              },
            },
            where: {
              id: lesson.id,
            },
          });
        }
      }
    }
    await prisma.userOnBookingTimeSlots.delete({
      where: {
        userId_bookingTimeSlotId: {
          userId: user.id,
          bookingTimeSlotId: id,
        },
      },
    });

    return res.status(201).json({ message: "leave class successfully" });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
