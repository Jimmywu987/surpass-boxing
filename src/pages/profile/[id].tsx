import { GetServerSideProps } from "next";

import { ViewUsedClass } from "@/features/admin/components/AdminAccount/ViewUsedClass";
import { ViewAccountEnums } from "@/features/common/enums/ViewAccountEnums";
import { EditAccountInfo } from "@/features/user/components/EditAccountInfo";
import { ViewAccountInfo } from "@/features/user/components/ViewAccountInfo";
import { ViewUnusedLesson } from "@/features/user/components/ViewUnusedLesson";
import { useEditAccountInputResolver } from "@/features/user/schema/useEditAccountInputResolver";
import { editAccountSchema } from "@/schemas/user/edit";
import { trpc } from "@/utils/trpc";
import { EditIcon } from "@chakra-ui/icons";
import { Skeleton, Stack } from "@chakra-ui/react";
import { isAfter } from "date-fns";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { ChangePassword } from "@/features/user/components/ChangePassword";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [view, setView] = useState(ViewAccountEnums.NORMAL);
  const session: any = useSession();
  const userId = session.data?.user?.id;
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
        ) : view === ViewAccountEnums.CHANGE_PASSWORD ? (
          <ChangePassword
            onBack={() => {
              setView(ViewAccountEnums.NORMAL);
            }}
            id={userId}
          />
        ) : (
          <div className="flex flex-col">
            {userId === id && (
              <EditIcon
                className="cursor-pointer text-xl"
                onClick={() => setView(ViewAccountEnums.EDIT)}
              />
            )}
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
