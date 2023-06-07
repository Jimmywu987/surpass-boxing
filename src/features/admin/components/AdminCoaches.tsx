import { Skeleton, Stack, useDisclosure } from "@chakra-ui/react";

import { ModalComponent } from "@/features/common/components/Modal";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";

import { trpc } from "@/utils/trpc";
import { User } from "@prisma/client";

import { AccountBasicInfo } from "@/features/admin/components/AdminAccount/AccountBasicInfo";
import { useSession } from "next-auth/react";
import { CoachConfirm } from "@/features/admin/components/AdminAccount/CoachConfirm";
import { cn } from "@/utils/cn";
import { AdminViewCoachOptionEnums } from "@/features/admin/enums/AdminOptionEnums";

import { ViewCoachInfo } from "@/features/admin/components/AdminAccount/ViewCoachInfo";

export const AdminCoaches = () => {
  const session = useSession();
  const user = session.data?.user as User;
  const { data, isLoading } = trpc.userRouter.fetchForAdmin.useQuery();

  const [account, setAccount] = useState<User | null>(null);
  const { mutateAsync, isLoading: updateDisplayIsLoading } =
    trpc.coachInfosRouter.updateDisplay.useMutation({
      onSuccess: async () => {
        setAccount((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            shouldShow: !prev?.shouldShow,
          };
        });
      },
    });
  const [view, setView] = useState(AdminViewCoachOptionEnums.VIEW_ACCOUNT);
  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const { onOpen, onClose } = modalDisclosure;
  const handleOpenModel = (user: User) => {
    setAccount(user);
    onOpen();
  };
  const handleCloseModel = () => {
    onClose();
    setView(AdminViewCoachOptionEnums.VIEW_ACCOUNT);
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
        onCloseProps={handleCloseModel}
        content={
          <div>
            {view === AdminViewCoachOptionEnums.VIEW_ACCOUNT ? (
              <div className="space-y-2 flex flex-col">
                <AccountBasicInfo account={account as User} />
                <div className="flex space-x-2 self-end">
                  <button
                    className={cn(
                      "px-3 py-1 rounded-md text-white",
                      !account?.shouldShow && "bg-green-500",
                      account?.shouldShow && "bg-gray-800",
                      updateDisplayIsLoading && "bg-gray-400"
                    )}
                    disabled={updateDisplayIsLoading}
                    onClick={async () =>
                      await mutateAsync({
                        userId: account?.id as string,
                        shouldShow: !account?.shouldShow,
                      })
                    }
                  >
                    {!account?.shouldShow
                      ? t("action.should_show")
                      : t("action.should_hide")}
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-md text-white bg-amber-600"
                    )}
                    onClick={() =>
                      setView(AdminViewCoachOptionEnums.VIEW_COACH_INFO)
                    }
                  >
                    {t("action.view_coach_into")}
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-md text-white ",
                      user.id === account?.id
                        ? " bg-gray-300"
                        : "hover:bg-red-400 bg-red-500 "
                    )}
                    onClick={() =>
                      setView(AdminViewCoachOptionEnums.REMOVE_COACH_CONFIRM)
                    }
                    disabled={user.id === account?.id}
                  >
                    {t("action.remove_authorization")}
                  </button>
                </div>
              </div>
            ) : view === AdminViewCoachOptionEnums.VIEW_COACH_INFO ? (
              <ViewCoachInfo
                onClick={() => {
                  setView(AdminViewCoachOptionEnums.VIEW_ACCOUNT);
                }}
                userId={account?.id as string}
              />
            ) : (
              <CoachConfirm
                confirmText={t("confirm_remove_authorization")}
                account={account as User}
                onReturn={() => setView(AdminViewCoachOptionEnums.VIEW_ACCOUNT)}
                onClose={handleCloseModel}
              />
            )}
          </div>
        }
      />
    </div>
  );
};
