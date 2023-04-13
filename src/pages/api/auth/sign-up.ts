import { validateSignUpInput } from "@/helpers/validateSignUpInput";
import { hashPassword } from "@/utils/hash";
import { prisma } from "@/services/prisma";
import { UserAuthOptionsEnum, UserStatusEnum } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const data = req.body;
    const { confirmPassword, password, profileImg, email, username } = data;

    if (!profileImg || !username || !email || !password) {
      return res.status(422).json({ errors: "Invalid Input" });
    }
    if (confirmPassword !== password) {
      return res.status(422).json({ errors: "Passwords must be matched" });
    }
    const hasUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (hasUser) {
      return res
        .status(422)
        .json({ errors: "Email has already been registered" });
    }
    const isValidInput = validateSignUpInput(email, password);
    if (!isValidInput) {
      return res.status(422).json({ errors: "Invalid Input" });
    }
    const hashedPassword = await hashPassword(password);
    const createUserData = {
      username,
      email,
      profileImg,
      password: hashedPassword,
      authOption: UserAuthOptionsEnum.CREDENTIAL,
      phoneNumber: "",
      status: UserStatusEnum.ACTIVE,
    };
    await prisma.user.create({
      data: createUserData,
    });

    return res.status(201).json({ message: "Created user." });
  }
};

export default handler;
