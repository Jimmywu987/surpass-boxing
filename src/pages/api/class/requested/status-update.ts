import { prisma } from "@/services/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

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
