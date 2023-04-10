import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth";
import { User, UserAuthOptionsEnum } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerConfig } from "@/lib/getServerConfig";
import { prisma } from "@/services/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { checkPassword, hashPassword } from "@/lib/hash";
import { UserStatusEnum } from "@prisma/client";
import { generateRandomString } from "@/helpers/generateRandomString";

const config = getServerConfig();

const {
  env: { REACT_APP_GOOGLE_ID, REACT_APP_GOOGLE_SECRET, JWT_SECRET },
} = config;
export const authOptions: AuthOptions = {
  secret: JWT_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jimmywu@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user) {
          return null;
        }
        const hashedPassword = user.password;
        const isValid = await checkPassword(password, hashedPassword);
        if (!isValid) {
          return null;
        }
        const { password: returnPassword, ...returnUserInfo } = user;
        return { ...returnUserInfo };
      },
    }),
    GoogleProvider({
      name: "google",
      clientId: REACT_APP_GOOGLE_ID,
      clientSecret: REACT_APP_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile: async (info) => {
        const { email, name, picture } = info;
        const hasUser = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (hasUser) {
          const { password, ...userInfo } = hasUser as User;
          return userInfo;
        }
        const hashedPassword = await hashPassword(generateRandomString(10));
        const createUserData = {
          username: name,
          email,
          profileImg: picture,
          password: hashedPassword,
          authOption: UserAuthOptionsEnum.GOOGLE,
          phoneNumber: "",
          status: UserStatusEnum.ACTIVE,
        };
        const user = await prisma.user.create({
          data: createUserData,
        });
        const { password, ...userInfo } = user as User;

        return userInfo;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          ...user,
        };
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token;
      return session;
    },
  },
};
const createOptions: (req: NextApiRequest) => NextAuthOptions = () =>
  authOptions;

export const NextAuthOption = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return NextAuth(req, res, createOptions(req));
};

export default NextAuthOption;
