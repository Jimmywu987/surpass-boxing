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
        <button
          onClick={() => setOption(AdminOptionEnums.NOTIFICATION)}
          className="text-xl"
        >
          {t("notification")}
        </button>
        <button
          onClick={() => setOption(AdminOptionEnums.CLASS_LEVEL_RECORD)}
          className="text-xl"
        >
          {t("class_level_record")}
        </button>
      </div>
      <div className="flex flex-1 px-8">
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
