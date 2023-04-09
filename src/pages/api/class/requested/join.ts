import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { Lessons, User } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { id } = req.body;
    const user = session?.user as User & { lessons: Lessons[] };
    const { lessons } = user;

    const canJoinClass = lessons.some(
      (lesson) => new Date(lesson.expiryDate) > new Date() && lesson.lesson > 0
    );

    if (!canJoinClass) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    await prisma.userOnBookingTimeSlots.create({
      data: {
        userId: user.id,
        bookingTimeSlotId: id,
      },
    });
    return res.status(201).json({ message: "join successfully" });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
