import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const classTypes = await prisma.classesType.findMany();
    return res.status(201).json({ classTypes });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
