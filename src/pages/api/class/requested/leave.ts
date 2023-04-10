import { prisma } from "@/services/prisma";
import { BookingTimeSlotStatusEnum, User } from "@prisma/client";
import { add, isAfter } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const { id, status } = req.body;
    const user = session?.user as User;
    if (status === BookingTimeSlotStatusEnum.CONFIRM) {
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
        const lessons = await prisma.lessons.findFirst({
          where: {
            userId: user.id,
            expiryDate: {
              gte: new Date(),
            },
          },
        });

        if (lessons) {
          await prisma.lessons.update({
            data: {
              lesson: {
                increment: 1,
              },
            },
            where: {
              id: lessons.id,
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
