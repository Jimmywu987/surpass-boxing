import DefaultProfileImg from "@/../public/default-profile-img.png";
import { format, isAfter } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import { trpc, RouterOutput } from "@/utils/trpc";
import { signOut, useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useMemo } from "react";
import { ViewAccountEnums } from "@/features/common/enums/ViewAccountEnums";
import { useRouter } from "next/router";
import { User } from "@prisma/client";

type inferType = RouterOutput["userRouter"]["fetchUserById"];

export const ViewAccountInfo = ({
  user,
  setView,
}: {
  user: Exclude<inferType, null>;
  setView: Dispatch<SetStateAction<ViewAccountEnums>>;
}) => {
  const session = useSession();
  const currentUser = session.data?.user as User;

  const router = useRouter();
  const { t } = useTranslation("common");
  const util = trpc.useContext();

  const isCurrentUser = currentUser.id === user.id;
  const unusedLessonNum = useMemo(
    () =>
      user.lessons
        ?.filter((lesson) => isAfter(new Date(lesson.expiryDate), new Date()))
        .reduce((pre, cur) => pre + cur.lesson, 0) ?? 0,
    [user.lessons]
  );
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-32 h-32 relative">
        <Image
          src={user.profileImg ?? DefaultProfileImg}
          alt={`${user.username} profile image`}
          className="w-full h-full rounded-full object-cover"
          fill
        />
      </div>
      <div className="space-y-1">
        <p className=" text-gray-600">
          {t("account.username")}: {user.username}
        </p>
        {currentUser.admin && (
          <p className=" text-gray-600">
            {t("account.email_address")}: {user.email}
          </p>
        )}
        {isCurrentUser ? (
          <p className=" text-gray-600">
            {t("account.phone_number")}:{" "}
            {!!user.phoneNumber ? user.phoneNumber : "/"}
          </p>
        ) : (
          currentUser.admin &&
          !!user.phoneNumber && (
            <p className=" text-gray-600">
              {t("account.phone_number")}: {user.phoneNumber}
            </p>
          )
        )}
        <p className=" text-gray-600">
          {t("account.created_at")}:{" "}
          {format(new Date(user.createdAt), "yyyy-MM-dd")}
        </p>
        <div className="flex justify-between my-2">
          <p className="text-gray-600">
            {t("admin:total_lessons")}: {user.userOnBookingTimeSlots.length}
          </p>
          <button
            className="hover:bg-gray-400 bg-gray-500 px-3 py-1 rounded-md text-white"
            onClick={() => setView(ViewAccountEnums.VIEW_USED_CLASS)}
          >
            {t("admin:check")}
          </button>
        </div>
        <div className="flex justify-between my-2">
          <p className="text-gray-600">
            {t("admin:unused_lessons")}: {unusedLessonNum}
          </p>
          <button
            className="hover:bg-gray-400 bg-gray-500 px-3 py-1 rounded-md text-white"
            onClick={() => setView(ViewAccountEnums.VIEW_UNUSED_CLASS)}
          >
            {t("admin:check")}
          </button>
        </div>
      </div>
      {isCurrentUser && (
        <button
          onClick={async () => {
            await signOut({
              callbackUrl: "/",
            });
          }}
          className="text-gray-600 self-end shadow border-2 border-gray-200 px-3 py-1 hover:text-gray-800 font-semibold"
        >
          {t("auth:sign_out")}
        </button>
      )}
    </div>
  );
};
