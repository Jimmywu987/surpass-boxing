import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  Lessons,
  User,
  BookingTimeSlots,
  UserOnBookingTimeSlots,
} from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { id, isConfirm } = req.body;
    const user = session?.user as User & { lessons: Lessons[] };
    const UserOnBookingTimeSlots =
      await prisma.userOnBookingTimeSlots.findUnique({
        where: {
          userId_bookingTimeSlotId: {
            userId: user.id,
            bookingTimeSlotId: id,
          },
        },
      });

    return res.status(201).json({ message: "join successfully" });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
