import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { ids } = req.body;
    const bookingTimeSlots =
      ids.length > 0
        ? await prisma.bookingTimeSlots.findMany({
            where: {
              id: {
                in: ids,
              },
            },
            orderBy: {
              date: "desc",
            },
          })
        : await prisma.bookingTimeSlots.findMany({
            orderBy: {
              date: "desc",
            },
          });

    return res.status(201).json({ bookingTimeSlots });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
