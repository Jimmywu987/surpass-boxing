import { prisma } from "@/services/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminAccountFilterOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { getServerSession } from "next-auth";
import { TAKE_NUMBER } from "@/constants";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (session && req.method === "POST") {
    const { admin } = req.query;
    const { skip, accountFilter, searchInput } = req.body;
    const totalUsersCount = await prisma.user.aggregate({
      where: {
        admin: admin ? true : false,
      },
      _count: true,
    });
    const searchInputQuery = !!searchInput
      ? {
          OR: [
            {
              username: {
                contains: searchInput,
              },
            },
            {
              email: {
                contains: searchInput,
              },
            },
          ],
        }
      : {};
    const lessonQuery =
      accountFilter === AdminAccountFilterOptionEnums.ALL
        ? {}
        : accountFilter === AdminAccountFilterOptionEnums.HAS_CLASSES
        ? {
            lessons: {
              some: {
                expiryDate: {
                  gte: new Date(),
                },
              },
            },
          }
        : {
            lessons: {
              every: {
                NOT: {
                  expiryDate: {
                    gte: new Date(),
                  },
                },
              },
            },
          };
    const users = admin
      ? await prisma.user.findMany({
          where: {
            admin: true,
          },
        })
      : await prisma.user.findMany({
          skip,
          take: TAKE_NUMBER,
          where: {
            admin: false,
            ...lessonQuery,
            ...searchInputQuery,
          },
          include: {
            userOnBookingTimeSlots: {
              where: {
                bookingTimeSlots: {
                  status: BookingTimeSlotStatusEnum.CONFIRM,
                },
              },
            },
            lessons: {
              select: {
                createdAt: true,
                lesson: true,
                expiryDate: true,
                id: true,
              },
            },
          },
        });

    return res
      .status(201)
      .json({ users, totalUsersCount: totalUsersCount._count });
  }
  return res.status(401).json({ errorMessage: "Unauthorized" });
};

export default handler;
