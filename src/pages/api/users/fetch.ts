import { prisma } from "@/services/prisma";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const USER_SELECT = {
  authOption: true,
  createdAt: true,
  id: true,
  username: true,
  profileImg: true,
  email: true,
  updatedAt: true,
  phoneNumber: true,
  lessions: {
    select: {
      createdAt: true,
      lession: true,
      expiryDate: true,
      id: true,
    },
  },
};
const TAKE_NUMBER = 10;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session && req.method === "POST") {
    const { admin } = req.query;
    const { skip } = req.body;
    const totalUsersCount = await prisma.user.aggregate({
      where: {
        admin: admin ? true : false,
      },
      _count: true,
    });
    const users = admin
      ? await prisma.user.findMany({
          select: USER_SELECT,
          where: {
            admin: true,
          },
        })
      : await prisma.user.findMany({
          select: USER_SELECT,
          skip,
          take: TAKE_NUMBER,
          where: {
            admin: false,
          },
        });
    return res
      .status(201)
      .json({ users, totalUsersCount: totalUsersCount._count });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
