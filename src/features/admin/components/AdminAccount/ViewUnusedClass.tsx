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
import { Lessons } from "@prisma/client";

export const ViewUnusedClass = ({
  lessons,
  setView,
}: {
  lessons: Lessons[];
  setView: Dispatch<SetStateAction<AdminViewAccountOptionEnums>>;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return <></>;
};
