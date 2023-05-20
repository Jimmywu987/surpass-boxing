import { NavButton } from "@/features/nav/components/button/NavButton";
import LogoIcon from "@/../public/logo.png";
import DefaultProfileImg from "@/../public/default-profile-img.png";
import { FacebookSvgIcon } from "@/features/common/components/buttons/svg/FacebookSvgIcon";
import { InstagramSvgIcon } from "@/features/common/components/buttons/svg/InstagramSvgIcon";
import { WhatsappSvgIcon } from "@/features/common/components/buttons/svg/WhatsappSvgIcon";
import { HamburgerIcon } from "@chakra-ui/icons";
import { NavLink } from "@/features/nav/components/NavLink";
import { clearUserInfo, updateUser, userSelector } from "@/redux/user";
import { LanguageEnum, User } from "@prisma/client";
import Image from "next/image";
import { useSession, getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useTranslation from "next-translate/useTranslation";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { LanguageSvgIcon } from "@/features/common/components/buttons/svg/LanguageSvgIcon";
import { MobileNavbar } from "@/features/nav/MobileNavbar";
import { useOneSignal } from "@/features/common/hooks/useOneSignal";
import { trpc } from "@/utils/trpc";

export const Navbar = () => {
  const dispatch = useDispatch();
  const { t, lang } = useTranslation("common");

  const router = useRouter();
  const { pathname, asPath, query } = router;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);
  const reduxUser = useSelector(userSelector);
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;
  const { storeUserExternalId } = useOneSignal();
  const { mutateAsync } = trpc.userRouter.updateLang.useMutation();
  useEffect(() => {
    const storeUserToRedux = async () => {
      const session = await getSession();
      if (session) {
        const { email, admin, phoneNumber, profileImg, username, id } =
          session?.user as Partial<User>;

        dispatch(
          updateUser({
            admin,
            email,
            phoneNumber,
            profileImg,
            username,
            id,
          })
        );
        if (!!id) {
          await storeUserExternalId(id);
        }
      } else {
        dispatch(clearUserInfo());
      }
    };

    storeUserToRedux();
  }, [isAuthenticated]);

  const onClickLanguageHandler = async (language: "zh-HK" | "en") => {
    router.push({ pathname, query }, asPath, { locale: language });
    await mutateAsync({
      lang: language === "en" ? LanguageEnum.EN : LanguageEnum.ZH,
    });
  };
  const langIsHk = lang === "zh-HK";
  return (
    <nav className=" flex py-3 px-5 justify-between items-center shadow-lg ">
      <div className="flex items-center flex-1 px-1 space-x-2 justify-between ">
        <div className="flex h-28 space-x-6 items-center">
          <Link
            href="/"
            passHref
            className="relative w-24 h-24 border-2 border-white rounded-full duration-200"
          >
            <Image
              src={LogoIcon}
              fill
              className="w-full h-full object-contain rounded-full"
              alt="logo-image"
            />
          </Link>
        </div>
        <div className="hidden md:flex flex-col justify-start">
          <div className="flex h-28">
            <div className="flex flex-col justify-between">
              <div className="my-1 mx-4 flex justify-end items-center">
                {reduxUser.admin && <NavLink text={t("admin")} url="/admin" />}

                <Menu>
                  <MenuButton
                    leftIcon={
                      <LanguageSvgIcon
                        h="22"
                        w="22"
                        className="group-hover:fill-theme-color fill-white group-expended:fill-theme-color"
                      />
                    }
                    as={Button}
                    color="white"
                    className="group"
                    bgColor="#1F2937"
                    _hover={{}}
                    _expanded={{ color: "#EE72B6", bgColor: "#1F2937" }}
                    _active={{}}
                  >
                    {t("current_language")}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      fontWeight={langIsHk ? "bold" : "normal"}
                      bgColor={langIsHk ? "#c8d3e1" : "white"}
                      color="#1F2937"
                      onClick={() => onClickLanguageHandler("zh-HK")}
                    >
                      中文(繁體)
                    </MenuItem>
                    <MenuItem
                      fontWeight={!langIsHk ? "bold" : "normal"}
                      bgColor={!langIsHk ? "#c8d3e1" : "white"}
                      color="#1F2937"
                      onClick={() => onClickLanguageHandler("en")}
                    >
                      English
                    </MenuItem>
                  </MenuList>
                </Menu>
              </div>
              <div className="flex items-end">
                <NavLink text={t("home")} url="/" />
                <NavLink text={t("classes")} url="/classes" />
                <NavLink text={t("coaches")} url="/coaches" />
                <NavLink text={t("location")} url="/location" />
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex space-x-3 ">
                {/* @todo: implement the links */}
                <WhatsappSvgIcon className="fill-white hover:fill-green-600 hover:scale-110 duration-200" />
                <FacebookSvgIcon className="fill-white hover:fill-blue-600 hover:scale-110 duration-200" />
                <InstagramSvgIcon className="fill-white hover:fill-pink-600 hover:scale-110 duration-200" />
              </div>
              {isAuthenticated && (
                <div className="flex self-end ">
                  <Link
                    href={`/profile/${user.id}`}
                    passHref
                    className="flex items-center space-x-2 transition hover:bg-link-bgHover hover:scale-110 text-white hover:text-theme-color rounded p-1 text-lg text-link-normal "
                  >
                    <div className="w-10 h-10 relative">
                      <Image
                        src={
                          !!reduxUser.profileImg
                            ? reduxUser.profileImg
                            : DefaultProfileImg
                        }
                        alt={`${reduxUser.username} profile image`}
                        className="w-full h-full rounded-full object-cover"
                        fill
                      />
                    </div>
                    <span className="truncate w-[4.5rem]">
                      {reduxUser.username}
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <Button ref={btnRef} onClick={onOpen} w="9" h="9">
            <HamburgerIcon h="8" w="8" className="bg-white rounded p-1" />
          </Button>
          <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton fontSize="xl" my="8" mr="6" w="10" h="10" />
              <DrawerHeader>Surpass Boxing</DrawerHeader>

              <DrawerBody>
                {/* @todo: Add all the navigation links */}
                <MobileNavbar />
              </DrawerBody>

              <DrawerFooter className="space-x-2">
                <WhatsappSvgIcon className="fill-gray-800 hover:fill-green-600 hover:scale-110 duration-200" />
                <FacebookSvgIcon className="fill-gray-800 hover:fill-blue-600 hover:scale-110 duration-200" />
                <InstagramSvgIcon className="fill-gray-800 hover:fill-pink-600 hover:scale-110 duration-200" />
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
};
