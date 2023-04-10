import { prisma } from "@/services/prisma";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { ids } = req.body;

    const bookingTimeSlots = await prisma.bookingTimeSlots.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.status(201).json({ bookingTimeSlots });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
