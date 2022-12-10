import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const getUserWithUserId = async (user_id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: user_id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      profileImg: true,
      phoneNumber: true,
      createdAt: true,
      admin: true,
      authOption: true,
      lessions: true,
    },
  });

  return user;
};
