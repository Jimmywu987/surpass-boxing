import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { subDays, add, format } from "date-fns";

import { BookingTimeSlotStatusEnum, User } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const data = req.body;
    const user = session?.user as User;
    if (!user.admin) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    const { lesson, durationUnit, duration } = data;
    const response = await prisma.lessons.create({
      data: {
        lesson,
        expiryDate: add(new Date(), { [durationUnit]: duration }),
        userId: user.id,
      },
    });

    return res.status(201).json({ lessons: response });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
