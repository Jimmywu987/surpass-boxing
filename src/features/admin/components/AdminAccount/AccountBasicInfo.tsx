import { User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import DefaultProfileImg from "@/../public/default-profile-img.png";
import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";

export const AccountBasicInfo = ({ account }: { account: User }) => {
  const { t } = useTranslation("classes");

  return (
    <div className="flex flex-col space-y-2">
      <Link
        href={`/profile/${account.id}`}
        passHref
        className="flex items-center space-x-2 transition hover:bg-link-bgHover  text-white hover:text-theme-color rounded p-1 text-lg text-link-normal "
      >
        <div className="w-10 h-10 relative">
          <Image
            src={account.profileImg ?? DefaultProfileImg}
            alt={`${account.username} profile image`}
            className="w-full h-full rounded-full object-cover"
            fill
          />
        </div>
      </Link>
      <p>
        {t("common:account.username")}: {account.username}
      </p>
      <p>
        {t("common:account.email_address")}: {account.email}
      </p>
      <p>
        {t("common:account.phone_number")}:{" "}
        {!!account.phoneNumber ? account.phoneNumber : "--"}
      </p>
      <p>
        {t("common:account.created_at")}:{" "}
        {format(new Date(account.createdAt!), "yyyy-MM-dd")}
      </p>
    </div>
  );
};
