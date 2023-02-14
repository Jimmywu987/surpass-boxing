import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import { User } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { status, id } = req.body;
    const user = session?.user as User;
    if (!user.admin) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }
    const response = await prisma.bookingTimeSlots.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    return res.status(201).json({ type: response });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
