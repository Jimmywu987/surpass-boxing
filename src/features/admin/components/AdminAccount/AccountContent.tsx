import { UserType } from "@/types";
import { UseDisclosureReturn } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";

import { CoachConfirm } from "@/features/admin/components/AdminAccount/CoachConfirm";
import { DeleteConfirm } from "@/features/admin/components/AdminAccount/DeleteConfirm";
import { ViewAccount } from "@/features/admin/components/AdminAccount/ViewAccount";
import { ViewUnusedClass } from "@/features/admin/components/AdminAccount/ViewUnusedClass";
import { ViewUsedClass } from "@/features/admin/components/AdminAccount/ViewUsedClass";
import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { isAfter } from "date-fns";
import { Dispatch, SetStateAction, useState } from "react";

export const AccountContent = ({
  accountState,
  modalDisclosure,
}: {
  accountState: [UserType | null, Dispatch<SetStateAction<UserType | null>>];
  modalDisclosure: UseDisclosureReturn;
}) => {
  const { t } = useTranslation("admin");
  const [account, setAccount] = accountState;
  const { onClose } = modalDisclosure;

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
        onClick={() => setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT)}
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
        onClick={() => setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT)}
      />
    );
  }
  if (view === AdminViewAccountOptionEnums.VIEW_CONFIRM_GRANT_AUTH) {
    return (
      <CoachConfirm
        confirmText={t("confirm_grant_authorization")}
        account={account}
        onReturn={() => setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT)}
        onClose={onClose}
      />
    );
  }
  if (view === AdminViewAccountOptionEnums.VIEW_CONFIRM_DELETE) {
    return (
      <DeleteConfirm
        confirmText={t("confirm_delete")}
        account={account}
        onReturn={() => setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT)}
        onClose={() => {
          onClose();
          setAccount(null);
        }}
      />
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
