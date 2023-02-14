import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
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
