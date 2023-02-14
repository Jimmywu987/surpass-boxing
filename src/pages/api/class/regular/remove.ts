import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { id } = req.body;
    await prisma.regularBookingTimeSlots.delete({
      where: { id },
    });
    return res.status(201).json({ message: "remove successfully" });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
