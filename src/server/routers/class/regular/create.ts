import { prisma } from "@/services/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const { setLimit, people, ...data } = req.body;
    const response = await prisma.regularBookingTimeSlots.create({
      data: { ...data, numberOfParticipants: setLimit ? people : null },
    });
    return res.status(201).json({ type: response });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
