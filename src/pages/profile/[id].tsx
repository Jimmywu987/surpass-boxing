import { User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { signOut, useSession } from "next-auth/react";

import DefaultProfileImg from "@/../public/default-profile-img.png";
import { useEditAccountInputResolver } from "@/features/user/schema/useEditAccountInputResolver";
import { editAccountSchema } from "@/schemas/user/edit";
import { trpc } from "@/utils/trpc";
import { ChevronLeftIcon, EditIcon } from "@chakra-ui/icons";
import { Skeleton, Stack } from "@chakra-ui/react";
import { format, isAfter } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { ViewAccountInfo } from "@/features/user/components/ViewAccountInfo";
import { EditAccountInfo } from "@/features/user/components/EditAccountInfo";
import { ViewAccountEnums } from "@/features/common/enums/ViewAccountEnums";
import { ViewUsedClass } from "@/features/admin/components/AdminAccount/ViewUsedClass";
import { ViewUnusedLesson } from "@/features/user/components/ViewUnusedLesson";

const ProfilePage = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const [view, setView] = useState(ViewAccountEnums.NORMAL);
  const session = useSession();

  const currentUser = session.data?.user as User;
  const editAccountInputFormMethod = useForm<
    z.infer<ReturnType<typeof editAccountSchema>>
  >({
    resolver: useEditAccountInputResolver(),
    mode: "onChange",
    defaultValues: {
      id: id as string,
      profileImg: "",
      username: "",
      phoneNumber: "",
    },
  });
  const { setValue } = editAccountInputFormMethod;
  const { data, isLoading } = trpc.userRouter.fetchUserById.useQuery(
    {
      id: id as string,
    },
    {
      onSuccess: (data) => {
        if (!data) {
          router.push("/");
          return data;
        }
        setValue("profileImg", data.profileImg);
        setValue("username", data.username);
        setValue("phoneNumber", data.phoneNumber);
        return data;
      },
    }
  );

  if (!data || isLoading) {
    return (
      <Stack display="flex" justifyContent="center" alignItems="center" my="12">
        <Skeleton height="350px" width="96" />
      </Stack>
    );
  }

  return (
    <div className="flex justify-center items-center my-12">
      <div className="w-full md:w-96 bg-white p-6 flex flex-col rounded space-y-6">
        {view === ViewAccountEnums.EDIT ? (
          <FormProvider {...editAccountInputFormMethod}>
            <EditAccountInfo setView={setView} user={data} />
          </FormProvider>
        ) : view === ViewAccountEnums.VIEW_USED_CLASS ? (
          <ViewUsedClass
            bookingTimeSlotIds={data.userOnBookingTimeSlots.map(
              (slot) => slot.bookingTimeSlotId
            )}
            onClick={() => setView(ViewAccountEnums.NORMAL)}
          />
        ) : view === ViewAccountEnums.VIEW_UNUSED_CLASS ? (
          <ViewUnusedLesson
            lessons={data.lessons.filter((lesson) =>
              isAfter(new Date(lesson.expiryDate), new Date())
            )}
            onClick={() => setView(ViewAccountEnums.NORMAL)}
          />
        ) : (
          <div className="flex flex-col">
            <EditIcon
              className="cursor-pointer text-xl"
              onClick={() => setView(ViewAccountEnums.EDIT)}
            />
            <ViewAccountInfo user={data} setView={setView} />
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const { id } = query;
  if (!id || Array.isArray(id)) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export default ProfilePage;
