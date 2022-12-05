import { NavButton } from "@/features/nav/components/button/NavButton";
import LogoIcon from "@/../public/logo.png";
import { FacebookSvgIcon } from "@/features/common/components/buttons/svg/FacebookSvgIcon";
import { InstagramSvgIcon } from "@/features/common/components/buttons/svg/InstagramSvgIcon";
import { WhatsappSvgIcon } from "@/features/common/components/buttons/svg/WhatsappSvgIcon";

import { NavLink } from "@/features/nav/components/NavLink";
import { clearUserInfo, updateUser, userSelector } from "@/redux/user";
import { User } from "@prisma/client";
import Image from "next/image";
import { signOut, useSession, getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useTranslation from "next-translate/useTranslation";

export const Navbar = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation("common");

  const reduxUser = useSelector(userSelector);
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;
  useEffect(() => {
    const storeUserToRedux = async () => {
      const session = await getSession();
      if (session) {
        const { email, admin, phoneNumber, profileImg, username } =
          session?.user as Partial<User>;
        dispatch(
          updateUser({
            admin,
            email,
            phoneNumber,
            profileImg,
            username,
          })
        );
      } else {
        dispatch(clearUserInfo());
      }
    };

    storeUserToRedux();
  }, [isAuthenticated]);

  return (
    <nav className=" flex py-3 px-5 justify-between items-center shadow-lg ">
      <div className="flex items-center flex-1 px-1 space-x-2 justify-between ">
        <Link
          href="/"
          passHref
          className="relative w-24 h-24 border-2 border-theme-color rounded-full duration-200"
        >
          <Image
            src={LogoIcon}
            fill
            className="w-full h-full object-contain rounded-full"
            alt="logo-image"
          />
        </Link>
        <div className="flex flex-col justify-start">
          {isAuthenticated && (
            <div className="flex items-center flex-1 justify-between ">
              <div className="flex items-center ">
                <Link
                  href={`/profile/${user.id}`}
                  passHref
                  className="flex items-center space-x-2 transition hover:bg-link-bgHover hover:scale-110 hover:text-theme-color rounded p-1 text-lg text-link-normal "
                >
                  <img
                    src={reduxUser.profileImg}
                    alt={`${reduxUser.username} profile image`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="hidden md:block">{reduxUser.username}</span>
                </Link>
              </div>
            </div>
          )}
          <div className="flex h-24">
            <div className="flex h-full items-end">
              <NavLink text={t("home")} url="/" />

              <NavLink text={t("classes")} url="/classes" />
              <NavLink text={t("coaches")} url="/coaches" />
              <NavLink text={t("location")} url="/location" />
            </div>
            <div className="flex space-x-2">
              {/* @todo: implement the links */}
              <FacebookSvgIcon className="hover:scale-110 duration-200" />
              <InstagramSvgIcon className=" hover:scale-110 duration-200" />
              <WhatsappSvgIcon className=" hover:scale-110 duration-200" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
