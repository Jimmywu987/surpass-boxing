import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Stack,
  useDisclosure,
  ButtonGroup,
} from "@chakra-ui/react";

import { ModalComponent } from "@/features/common/components/Modal";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import useTranslation from "next-translate/useTranslation";
import {
  KeyboardEvent,
  useState,
  useRef,
  SetStateAction,
  Dispatch,
} from "react";
import { PageNumberDisplay } from "@/features/common/components/PageNumberDisplay";
// import { UserType } from "@/types";
import { AccountContent } from "@/features/admin/components/AdminAccount/AccountContent";
import { AdminAccountFilterOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { OptionButton } from "@/features/common/components/buttons/OptionButton";
import { SKIP_NUMBER, TAKE_NUMBER } from "@/constants";
import { trpc } from "@/utils/trpc";
import { UserType } from "@/types";

export const AdminAccounts = () => {
  const searchAccountInputValue = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState({
    skip: 0,
    accountFilter: AdminAccountFilterOptionEnums.ALL,
    searchInput: "",
  });

  const { data, isLoading } = trpc.userRouter.fetch.useQuery(query);

  const [account, setAccount] = useState<UserType | null>(null);

  const { t } = useTranslation("admin");
  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;
  const handleOpenModel = (user: UserType) => {
    setAccount(user);
    onOpen();
  };

  const onKeyPressSearchAccount = async (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      await searchAccount();
    }
  };
  const onSubmitSearchAccount = async () => {
    await searchAccount();
  };
  const searchAccount = async () => {
    if (searchAccountInputValue && searchAccountInputValue.current) {
      setQuery((pre) => ({
        ...pre,
        skip: 0,
        searchInput: searchAccountInputValue.current!.value,
      }));
    }
  };
  if (!data || isLoading) {
    return (
      <Stack>
        <Skeleton height="30px" />
      </Stack>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row items-center space-x-2 border-b border-b-gray-600 py-3">
        <InputGroup className="flex space-x-2">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder={t("admin:search_account")}
            ref={searchAccountInputValue}
            onKeyDown={onKeyPressSearchAccount}
            outline="none"
            color="gray.700"
            variant="unstyle"
          />
          <Button onClick={onSubmitSearchAccount} color="gray.700">
            {t("admin:action.search")}
          </Button>
        </InputGroup>
        <ButtonGroup gap="4">
          <OptionButton
            buttonText={t("admin:all")}
            currentValue={query.accountFilter}
            optionValue={AdminAccountFilterOptionEnums.ALL}
            onClick={() =>
              setQuery(() => ({
                accountFilter: AdminAccountFilterOptionEnums.ALL,
                skip: 0,
                searchInput: searchAccountInputValue.current!.value,
              }))
            }
          />
          <OptionButton
            buttonText={t("admin:member")}
            currentValue={query.accountFilter}
            optionValue={AdminAccountFilterOptionEnums.HAS_CLASSES}
            onClick={() =>
              setQuery(() => ({
                accountFilter: AdminAccountFilterOptionEnums.HAS_CLASSES,
                skip: 0,
                searchInput: searchAccountInputValue.current!.value,
              }))
            }
          />
          <OptionButton
            buttonText={t("admin:idle_member")}
            currentValue={query.accountFilter}
            optionValue={AdminAccountFilterOptionEnums.NO_CLASSES}
            onClick={() =>
              setQuery(() => ({
                accountFilter: AdminAccountFilterOptionEnums.NO_CLASSES,
                skip: 0,
                searchInput: searchAccountInputValue.current!.value,
              }))
            }
          />
        </ButtonGroup>
      </div>

      <div className="space-y-2">
        {data.users.map((user) => {
          return (
            <div
              key={user.id}
              className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg hover:bg-gray-400 cursor-pointer"
              onClick={() => {
                handleOpenModel(user);
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
              currentPage={query.skip / TAKE_NUMBER + 1}
              totalPages={Math.ceil(data.totalUsersCount / TAKE_NUMBER)}
              setQuery={setQuery as Dispatch<SetStateAction<{ skip: number }>>}
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
          <div>{t("admin:no_account")}</div>
        )}
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          <AccountContent modalDisclosure={modalDisclosure} account={account} />
        }
      />
    </div>
  );
};
