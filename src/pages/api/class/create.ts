import { prisma } from "@/services/prisma";

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const { name } = req.body;
    const response = await prisma.classesType.create({
      data: { name },
    });
    return res.status(201).json({ classType: response });
  }
  return res
    .status(401)
    .json({ errorMessage: "Something went wrong, please try again." });
};

export default handler;
