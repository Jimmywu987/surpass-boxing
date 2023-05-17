import DefaultProfileImg from "@/../public/default-profile-img.png";
import { userSelector } from "@/redux/user";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import { useSelector } from "react-redux";
import { trpc, RouterOutput } from "@/utils/trpc";
import { signOut } from "next-auth/react";

type inferType = RouterOutput["userRouter"]["fetchUserById"];

export const ViewAccountInfo = ({
  user,
}: {
  user: Exclude<inferType, null>;
}) => {
  const reduxUser = useSelector(userSelector);
  const { t } = useTranslation("common");
  const util = trpc.useContext();

  const isCurrentUser = reduxUser.id === user.id;
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
        {reduxUser.admin && (
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
          reduxUser.admin &&
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
      </div>
      {isCurrentUser && (
        <button
          onClick={async () => {
            signOut();
          }}
          className="text-gray-600 self-end shadow border-2 border-gray-200 px-3 py-1 hover:text-gray-800 font-semibold"
        >
          {t("auth:sign_out")}
        </button>
      )}
    </div>
  );
};
