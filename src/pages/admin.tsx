import { AdminAccounts } from "@/features/admin/components/AdminAccounts";
import { AdminClasses } from "@/features/admin/components/AdminClasses";
import { AdminClassLevelRecord } from "@/features/admin/components/AdminClassLevelRecord";
import { AdminCoaches } from "@/features/admin/components/AdminCoaches";
import { AdminNews } from "@/features/admin/components/AdminNews";
import { AdminNotification } from "@/features/admin/components/AdminNotification";
import { AdminOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";

const AdminPage = () => {
  const { t } = useTranslation("admin");

  const [option, setOption] = useState(AdminOptionEnums.CLASSES);
  const [viewOption, setViewOption] = useState(true);
  const setOptionHandler = (option: AdminOptionEnums) => {
    setOption(option);
    setViewOption(false);
  };
  return (
    <div className="text-white flex my-6">
      <div
        className={`md:flex flex-col items-start space-y-2 px-4 md:px-0 ${
          !viewOption ? "hidden" : "flex"
        }`}
      >
        <button
          onClick={() => setOptionHandler(AdminOptionEnums.CLASSES)}
          className="text-2xl"
        >
          {t("classes")}
        </button>
        <button
          onClick={() => setOptionHandler(AdminOptionEnums.ACCOUNT)}
          className="text-2xl"
        >
          {t("members")}
        </button>
        <button
          onClick={() => setOptionHandler(AdminOptionEnums.COACHES)}
          className="text-2xl"
        >
          {t("coaches")}
        </button>
        <button
          onClick={() => setOptionHandler(AdminOptionEnums.NEWS)}
          className="text-2xl"
        >
          {t("news_board")}
        </button>
        <button
          onClick={() => setOptionHandler(AdminOptionEnums.NOTIFICATION)}
          className="text-2xl"
        >
          {t("notification")}
        </button>
        <button
          onClick={() => setOptionHandler(AdminOptionEnums.CLASS_LEVEL_RECORD)}
          className="text-2xl"
        >
          {t("class_level_record")}
        </button>
      </div>
      <div
        className={`w-full md:flex md:flex-1 space-y-2 md:space-y-0 px-2 md:px-8 ${
          viewOption && "hidden"
        }`}
      >
        <button
          onClick={() => setViewOption(true)}
          className="flex text-xl border border-gray-100 rounded px-2 md:hidden"
        >
          {t("action.view_option")}
        </button>
        {option === AdminOptionEnums.CLASSES && <AdminClasses />}
        {option === AdminOptionEnums.ACCOUNT && <AdminAccounts />}
        {option === AdminOptionEnums.COACHES && <AdminCoaches />}
        {option === AdminOptionEnums.NEWS && <AdminNews />}
        {option === AdminOptionEnums.NOTIFICATION && <AdminNotification />}
        {option === AdminOptionEnums.CLASS_LEVEL_RECORD && (
          <AdminClassLevelRecord />
        )}
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

  return {
    props: {},
  };
};

export default AdminPage;
