import { prisma } from "@/services/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const regularBookingTimeSlots =
      await prisma.regularBookingTimeSlots.findMany({
        include: {
          coach: {
            select: {
              username: true,
            },
          },
        },
      });

    return res.status(201).json({ regularBookingTimeSlots });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
