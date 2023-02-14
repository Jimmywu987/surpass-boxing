import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const news = await prisma.news.findMany();

    return res.status(201).json({ news });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
