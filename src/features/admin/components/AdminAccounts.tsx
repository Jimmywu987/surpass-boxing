import { useUsersQuery } from "@/apis/api";
import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";
import { ModalComponent } from "@/features/common/components/Modal";
import { AdminPageProps } from "@/pages/admin";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";
import { PageNumberDisplay } from "@/features/common/components/PageNumberDisplay";
const SKIP_NUMBER = 10;
const TAKE_NUMBER = 10;
export const AdminAccounts = () => {
  const [query, setQuery] = useState({ skip: 0 });
  const { data, isLoading } = useUsersQuery(false, { skip: query.skip });

  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;
  const handleOpenModel = () => {
    onOpen();
  };
  console.log("data", data);
  if (!data || isLoading) {
    return (
      <Stack>
        <Skeleton height="30px" />
      </Stack>
    );
  }

  return (
    <div>
      <div>
        {/* search input */}
        {/* filter memberships buttons */}
      </div>
      <>
        <div className="space-y-2">
          {data.users.map((user) => {
            return (
              <div
                key={user.id}
                className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg hover:bg-gray-400 cursor-pointer"
                onClick={() => {
                  handleOpenModel();
                }}
              >
                <div className="space-y-2">
                  <div className="text-2xl flex items-center space-x-2">
                    <span className="font-semibold">{user.username}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between"></div>
              </div>
            );
          })}
          {data.users.length !== 0 ? (
            <div className="flex justify-between">
              <button
                className={`flex space-x-1 items-center ${
                  query.skip === 0 && " cursor-default opacity-40 "
                }`}
                onClick={() => {
                  setQuery((prev) => ({
                    ...prev,
                    skip: prev.skip - SKIP_NUMBER,
                  }));
                }}
                disabled={query.skip === 0}
              >
                <ChevronLeftIcon className="text-xl" />
                <span>{t("common:action.previous")}</span>
              </button>
              <PageNumberDisplay
                currentPage={SKIP_NUMBER / TAKE_NUMBER + 1}
                totalPages={Math.ceil(data.totalUsersCount / TAKE_NUMBER)}
                setQuery={setQuery}
              />
              <button
                className={`flex space-x-1 items-center ${
                  data.totalUsersCount < query.skip + SKIP_NUMBER &&
                  " cursor-default opacity-40 "
                }`}
                onClick={() => {
                  setQuery((prev) => ({
                    ...prev,
                    skip: prev.skip + SKIP_NUMBER,
                  }));
                }}
                disabled={data.totalUsersCount < query.skip + SKIP_NUMBER}
              >
                <span>{t("common:action.next")}</span>
                <ChevronRightIcon className="text-xl" />
              </button>
            </div>
          ) : (
            <div>{t("admin:no_data")}</div>
          )}
        </div>
      </>
      <ModalComponent modalDisclosure={modalDisclosure} content={<></>} />
    </div>
  );
};
