import { Skeleton, Stack, useDisclosure } from "@chakra-ui/react";

import { ModalComponent } from "@/features/common/components/Modal";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";
// import { UserType } from "@/types";
import { trpc } from "@/utils/trpc";
import { User } from "@prisma/client";

import { AccountBasicInfo } from "@/features/admin/components/AdminAccount/AccountBasicInfo";
import { useSession } from "next-auth/react";

export const AdminCoaches = () => {
  const utils = trpc.useContext();
  const session = useSession();
  const user = session.data?.user as User;
  const { data, isLoading } = trpc.userRouter.fetchForAdmin.useQuery();
  const { mutateAsync } = trpc.userRouter.addOrRemoveAdmin.useMutation({
    onSuccess: () => {
      utils.userRouter.fetchForAdmin.invalidate();
    },
  });

  const [account, setAccount] = useState<User | null>(null);
  const [confirmView, setConfirmView] = useState(false);
  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;
  const handleOpenModel = (user: User) => {
    setAccount(user);
    onOpen();
  };

  if (!data || isLoading) {
    return (
      <Stack>
        <Skeleton height="30px" />
      </Stack>
    );
  }

  return (
    <div className="space-y-2 flex flex-col flex-1">
      <h3 className="text-2xl">{t("coaches")}</h3>
      <div className="space-y-2">
        {data.users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg hover:bg-gray-400 cursor-pointer"
            onClick={() => {
              handleOpenModel(user);
            }}
          >
            <div className="space-y-2">
              <div className="text-xl flex items-center space-x-2">
                <span className="font-semibold">{user.username}</span>
              </div>
            </div>
            <div className="flex flex-col justify-between"></div>
          </div>
        ))}
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          <div>
            {!confirmView ? (
              <div className="space-y-2 flex flex-col">
                <AccountBasicInfo account={account as User} />
                <button
                  className={`${
                    user.id === account?.id
                      ? " bg-gray-300"
                      : "hover:bg-red-400 bg-red-500 "
                  } px-3 py-1 rounded-md text-white self-end`}
                  onClick={() => setConfirmView(true)}
                  disabled={user.id === account?.id}
                >
                  {t("action.remove_authorization")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-blueGray-700 text-lg text-center">
                  {t("confirm_remove_authorization")}
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    className="bg-gray-500 px-3 py-1 rounded-md text-white self-end"
                    onClick={() => setConfirmView(false)}
                  >
                    {t("action.cancel")}
                  </button>
                  <button
                    className="hover:bg-red-400 bg-red-500 px-3 py-1 rounded-md text-white self-end"
                    onClick={async () => {
                      await mutateAsync({
                        id: account?.id as string,
                        admin: false,
                      });
                    }}
                  >
                    {t("action.confirm")}
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};
