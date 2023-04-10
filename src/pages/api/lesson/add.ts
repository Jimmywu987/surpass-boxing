import { prisma } from "@/services/prisma";
import { add } from "date-fns";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const data = req.body;
    const user = session?.user as User;

    if (!user.admin) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }

    const { lesson, durationUnit, duration, userId } = data;
    const response = await prisma.lessons.create({
      data: {
        lesson,
        expiryDate: add(new Date(), { [durationUnit]: duration }),
        userId,
      },
    });

    return res.status(201).json({ lessons: response });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
