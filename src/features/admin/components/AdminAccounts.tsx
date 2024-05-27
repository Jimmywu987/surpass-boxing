import {
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";

import { ModalComponent } from "@/features/common/components/Modal";
import { SearchIcon } from "@chakra-ui/icons";
import useTranslation from "next-translate/useTranslation";
import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { UserType } from "@/types";
import { AccountContent } from "@/features/admin/components/AdminAccount/AccountContent";
import { AdminAccountFilterOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { OptionButton } from "@/features/common/components/buttons/OptionButton";
import { PaginationSection } from "@/features/common/components/PaginationSection";

import { trpc } from "@/utils/trpc";

export const AdminAccounts = () => {
  const searchAccountInputValue = useRef<HTMLInputElement>(null);
  const utils = trpc.useContext();

  const [query, setQuery] = useState({
    skip: 0,
    accountFilter: AdminAccountFilterOptionEnums.ALL,
    searchInput: "",
  });

  const { data, isLoading } = trpc.userRouter.fetch.useQuery(query);

  const accountState = useState<UserType | null>(null);
  const [account, setAccount] = accountState;
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
    <div className="space-y-2 flex flex-col flex-1">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-2 border-b border-b-gray-600 py-3 md:w-4/6 space-y-2 md:space-y-0">
        <InputGroup className="flex md:space-x-2">
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
          <Button onClick={onSubmitSearchAccount} color="gray.700" ml="2">
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
        {data.users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between p-5 border border-gray-600 rounded-md shadow-lg hover:bg-gray-400 cursor-pointer"
            onClick={() => {
              handleOpenModel(user);
            }}
          >
            <div className="space-y-2">
              <div className="text-xl flex items-center space-x-2">
                <span className="font-semibold">{user.username}</span>
              </div>
            </div>
            <div className="flex flex-col justify-between"></div>
          </div>
        ))}

        {data.users.length !== 0 ? (
          <PaginationSection
            setQuery={setQuery as Dispatch<SetStateAction<{ skip: number }>>}
            query={query}
            totalCount={data.totalUsersCount}
          />
        ) : (
          <div>{t("admin:no_account")}</div>
        )}
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          <AccountContent
            modalDisclosure={modalDisclosure}
            accountState={accountState}
          />
        }
      />
    </div>
  );
};
