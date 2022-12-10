import { useSession } from "next-auth/react";
import { AppProps } from "next/app";
import { GetServerSideProps } from "next";
import { User } from "@prisma/client";
import { getUserWithUserId } from "@/services/prisma";

export type ProfilePageProps = AppProps & {
  user: User;
};

const ProfilePage = (props: ProfilePageProps) => {
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const currentUser = session.data?.user as User;

  return <div></div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const { id } = query;
  if (!id || Array.isArray(id)) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }
  const user = await getUserWithUserId(id);
  if (!user) {
    return {
      notFound: true,
    };
  }
  return {
    props: user,
  };
};

export default ProfilePage;
