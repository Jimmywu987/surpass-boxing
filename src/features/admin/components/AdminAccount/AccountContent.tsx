import { UserType } from "@/types";
import { UseDisclosureReturn } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import DefaultProfileImg from "@/../public/default-profile-img.png";

import Link from "next/link";

import { useDispatch } from "react-redux";
import { isAfter } from "date-fns";
import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { useState } from "react";
import { ViewAccount } from "@/features/admin/components/AdminAccount/ViewAccount";
import { ViewUsedClass } from "@/features/admin/components/AdminAccount/ViewUsedClass";
import { ViewUnusedClass } from "@/features/admin/components/AdminAccount/ViewUnusedClass";
import { trpc } from "@/utils/trpc";

export const AccountContent = ({
  account,
  modalDisclosure,
}: {
  account: UserType | null;
  modalDisclosure: UseDisclosureReturn;
}) => {
  const { t } = useTranslation("admin");
  const dispatch = useDispatch();
  const utils = trpc.useContext();

  const { mutateAsync } = trpc.userRouter.addOrRemoveAdmin.useMutation({
    onSuccess: () => {
      utils.userRouter.fetch.invalidate();
    },
  });
  if (!account) {
    return <></>;
  }
  const [viewAccount, setViewAccount] = useState<UserType>(account);
  const [view, setView] = useState(AdminViewAccountOptionEnums.VIEW_ACCOUNT);

  if (view === AdminViewAccountOptionEnums.VIEW_UNUSED_CLASS) {
    return (
      <ViewUnusedClass
        lessons={viewAccount.lessons.filter((lesson) =>
          isAfter(new Date(lesson.expiryDate), new Date())
        )}
        setView={setView}
        setViewAccount={setViewAccount}
      />
    );
  }
  if (view === AdminViewAccountOptionEnums.VIEW_USED_CLASS) {
    return (
      <ViewUsedClass
        bookingTimeSlotIds={viewAccount.userOnBookingTimeSlots.map(
          (slot) => slot.bookingTimeSlotId
        )}
        setView={setView}
      />
    );
  }
  if (view === AdminViewAccountOptionEnums.VIEW_CONFIRM_GRANT_AUTH) {
    return (
      <div className="space-y-3">
        <p className="text-blueGray-700 text-lg text-center">
          {t("confirm_grant_authorization")}
        </p>
        <div className="flex space-x-3 justify-center">
          <button
            className="bg-gray-500 px-3 py-1 rounded-md text-white self-end"
            onClick={() => setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT)}
          >
            {t("action.cancel")}
          </button>
          <button
            className="hover:bg-red-400 bg-red-500 px-3 py-1 rounded-md text-white self-end"
            onClick={async () => {
              await mutateAsync({
                id: account.id,
                admin: true,
              });
            }}
          >
            {t("action.confirm")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ViewAccount
      account={viewAccount}
      setView={setView}
      setViewAccount={setViewAccount}
    />
  );
};
