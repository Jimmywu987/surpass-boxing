import { AdminAccounts } from "@/features/admin/components/AdminAccounts";
import { AdminClasses } from "@/features/admin/components/AdminClasses";
import { AdminNews } from "@/features/admin/components/AdminNews";
import { AdminOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { AdminCoaches } from "@/features/admin/components/AdminCoaches";
import { prisma } from "@/services/prisma";
import {
  User,
  ClassesType,
  News,
  RegularBookingTimeSlots,
  BookingTimeSlots,
} from "@prisma/client";
import { GetServerSideProps } from "next";
import useTranslation from "next-translate/useTranslation";
import { AppProps } from "next/app";
import { useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

export type AdminPageProps = AppProps & {
  users: User[];
  classTypes: ClassesType[];
  news: News;
  regularBookingTimeSlots: RegularBookingTimeSlots[];
  bookingTimeSlots: BookingTimeSlots[];
};

const AdminPage = () => {
  const { t } = useTranslation("admin");

  const [option, setOption] = useState(AdminOptionEnums.CLASSES);
  return (
    <div className="text-white flex my-6">
      <div className="flex flex-col items-start space-y-1">
        <button
          onClick={() => setOption(AdminOptionEnums.CLASSES)}
          className="text-xl"
        >
          {t("classes")}
        </button>
        <button
          onClick={() => setOption(AdminOptionEnums.ACCOUNT)}
          className="text-xl"
        >
          {t("members")}
        </button>
        <button
          onClick={() => setOption(AdminOptionEnums.COACHES)}
          className="text-xl"
        >
          {t("coaches")}
        </button>
        <button
          onClick={() => setOption(AdminOptionEnums.NEWS)}
          className="text-xl"
        >
          {t("news_board")}
        </button>
      </div>
      <div className="flex flex-1 px-6">
        {option === AdminOptionEnums.CLASSES && <AdminClasses />}
        {option === AdminOptionEnums.ACCOUNT && <AdminAccounts />}
        {option === AdminOptionEnums.COACHES && <AdminCoaches />}
        {option === AdminOptionEnums.NEWS && <AdminNews />}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }
  const { admin } = session.user as User;
  if (!admin) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }
  const classTypes = await prisma.classesType.findMany();
  const users = await prisma.user.findMany();
  const news = await prisma.news.findMany();
  const regularBookingTimeSlots =
    await prisma.regularBookingTimeSlots.findMany();
  const bookingTimeSlots = await prisma.bookingTimeSlots.findMany({
    orderBy: {
      date: "desc",
    },
  });
  return {
    props: JSON.parse(
      JSON.stringify({
        classTypes,
        users,
        news,
        regularBookingTimeSlots,
        bookingTimeSlots,
      })
    ),
  };
};

export default AdminPage;
