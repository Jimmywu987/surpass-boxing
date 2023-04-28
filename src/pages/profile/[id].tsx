import { signOut, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import { GetServerSideProps } from "next";
import { User } from "@prisma/client";
import { getUserWithUserId } from "@/services/prisma";
import Image from "next/image";
import DefaultProfileImg from "@/../public/default-profile-img.png";
import { userSelector } from "@/redux/user";
import { useSelector } from "react-redux";
import Link from "next/link";

export type ProfilePageProps = AppProps & {
  user: User;
};

const ProfilePage = (props: ProfilePageProps) => {
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const currentUser = session.data?.user as User;

  const reduxUser = useSelector(userSelector);

  return (
    <div>
      <div className="text-white">
        <div className="w-28 h-28 relative">
          <Image
            src={reduxUser.profileImg ?? DefaultProfileImg}
            alt={`${reduxUser.username} profile image`}
            className="w-full h-full rounded-full object-cover"
            fill
          />
        </div>
        <p>{reduxUser.username}</p>
      </div>
      <div className="text-white flex flex-col">
        <Link href="/admin" passHref className="">
          管理課堂/帳戶
        </Link>
        <button
          onClick={async () => {
            signOut();
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
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
    props: JSON.parse(JSON.stringify(user)),
  };
};

export default ProfilePage;
