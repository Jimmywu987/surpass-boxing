import { TAKE_NUMBER } from "@/constants";
import { AdminAccountFilterOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { protectedProcedure, router } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { BookingTimeSlotStatusEnum } from "@prisma/client";
import { z } from "zod";

export const userRouter = router({
  fetch: protectedProcedure
    .input(
      z.object({
        skip: z.number(),
        searchInput: z.string(),
        accountFilter: z.enum([
          AdminAccountFilterOptionEnums.ALL,
          AdminAccountFilterOptionEnums.HAS_CLASSES,
          AdminAccountFilterOptionEnums.NO_CLASSES,
        ]),
      })
    )
    .query(async ({ input }) => {
      const { skip, accountFilter, searchInput } = input;
      const totalUsersCount = await prisma.user.aggregate({
        where: {
          admin: false,
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
      const users = await prisma.user.findMany({
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
      return { users, totalUsersCount: totalUsersCount._count };
    }),
  fetchForAdmin: protectedProcedure.query(async () => {
    const totalUsersCount = await prisma.user.aggregate({
      where: {
        admin: true,
      },
      _count: true,
    });

    const users = await prisma.user.findMany({
      where: {
        admin: true,
      },
    });

    return { users, totalUsersCount: totalUsersCount._count };
  }),
});
