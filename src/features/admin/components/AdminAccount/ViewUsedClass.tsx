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
import { Dispatch, SetStateAction, useState } from "react";
import { useBookingTimeSlotQuery } from "@/apis/api";
import { ChevronLeftIcon } from "@chakra-ui/icons";

export const ViewUsedClass = ({
  bookingTimeSlotIds,
  setView,
}: {
  bookingTimeSlotIds: string[];
  setView: Dispatch<SetStateAction<AdminViewAccountOptionEnums>>;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data, isLoading } = useBookingTimeSlotQuery({
    ids: bookingTimeSlotIds,
  });

  if (isLoading || !data) {
    return <></>;
  }
  return (
    <div>
      <ChevronLeftIcon
        fontSize="3xl"
        cursor={"pointer"}
        onClick={() => {
          setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT);
        }}
      />
    </div>
  );
};
