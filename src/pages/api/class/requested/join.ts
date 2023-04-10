import { prisma } from "@/services/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const { id } = req.body;
    const user = session?.user as User;

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
      orderBy: {
        expiryDate: "asc",
      },
    });

    if (lessons.length === 0) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    await prisma.$transaction(async (txn) => {
      await txn.lessons.update({
        data: {
          lesson: {
            decrement: 1,
          },
        },
        where: {
          id: lessons[0].id,
        },
      });
      await txn.userOnBookingTimeSlots.create({
        data: {
          userId: user.id,
          bookingTimeSlotId: id,
        },
      });
    });

    return res.status(201).json({ message: "join successfully" });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
