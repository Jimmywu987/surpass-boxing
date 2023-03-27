import { UserType } from "@/types";
import { UseDisclosureReturn } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import DefaultProfileImg from "@/../public/default-profile-img.png";

import Link from "next/link";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { useState } from "react";
import { ViewAccount } from "@/features/admin/components/AdminAccount/ViewAccount";
import { ViewUsedClass } from "@/features/admin/components/AdminAccount/ViewUsedClass";
import { ViewUnusedClass } from "@/features/admin/components/AdminAccount/ViewUnusedClass";

export const AccountContent = ({
  account,
  modalDisclosure,
}: {
  account: UserType | null;
  modalDisclosure: UseDisclosureReturn;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  if (!account) {
    return <></>;
  }
  const [viewAccount, setViewAccount] = useState<UserType>(account);
  const [view, setView] = useState(AdminViewAccountOptionEnums.VIEW_ACCOUNT);

  if (view === AdminViewAccountOptionEnums.VIEW_UNUSED_CLASS) {
    return <ViewUnusedClass account={viewAccount} setView={setView} />;
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
  return (
    <ViewAccount
      account={viewAccount}
      setView={setView}
      setViewAccount={setViewAccount}
    />
  );
};
