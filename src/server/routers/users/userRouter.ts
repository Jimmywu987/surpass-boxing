import { TAKE_NUMBER } from "@/constants";
import { AdminAccountFilterOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { protectedProcedure, router } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { BookingTimeSlotStatusEnum, LanguageEnum, User } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { editAccountSchema } from "@/schemas/user/edit";
import { updateLevelSchema } from "@/schemas/user/updateLevel";
import { changePasswordSchema } from "@/schemas/user/changePassword";
import { checkPassword, hashPassword } from "@/utils/hash";

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
              startDate: true,
              id: true,
              level: true,
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
  addOrRemoveAdmin: protectedProcedure
    .input(z.object({ id: z.string(), admin: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user as User;
      const { id, admin } = input;
      if (user.id === id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          admin,
        },
      });
    }),
  deleteAccount: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user as User;
      const { id } = input;
      if (!user.admin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
      await prisma.userOnBookingTimeSlots.deleteMany({
        where: {
          userId: id,
        },
      });
      await prisma.user.delete({
        where: {
          id,
        },
      });
    }),

  fetchUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      let result = await prisma.user.findUnique({
        where: {
          id: input.id,
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
              startDate: true,
              expiryDate: true,
              id: true,
              level: true,
            },
          },
        },
      });
      if (result) {
        result.password = "";
      }
      return result;
    }),

  edit: protectedProcedure
    .input(editAccountSchema())
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user as User;
      const { id, ...rest } = input;
      if (user.id !== input.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...rest,
        },
      });
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user as User;
      const { id, password, confirmPassword, oldPassword } = input;
      if (user.id !== id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      if (confirmPassword !== password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "incorrect password",
        });
      }

      const currentUser = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          password: true,
        },
      });
      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      const isValid = await checkPassword(oldPassword, currentUser.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    }),

  updateLevel: protectedProcedure
    .input(updateLevelSchema())
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user as User;
      if (!user.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const { id, level } = input;
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          level,
        },
      });
      return null;
    }),
  updateLang: protectedProcedure
    .input(
      z.object({
        lang: z.enum([LanguageEnum.EN, LanguageEnum.ZH]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user as User;
      const { lang } = input;
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lang,
        },
      });
    }),
});
