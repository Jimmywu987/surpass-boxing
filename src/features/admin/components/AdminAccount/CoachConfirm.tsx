import { trpc } from "@/utils/trpc";
import { User } from "@prisma/client";
import useTranslation from "next-translate/useTranslation";

export const CoachConfirm = ({
  onReturn,
  confirmText,
  account,
  onClose,
}: {
  onReturn: () => void;
  onClose: () => void;
  confirmText: string;
  account: User;
}) => {
  const { t } = useTranslation("admin");
  const utils = trpc.useContext();
  const { mutateAsync, isLoading, isSuccess } =
    trpc.userRouter.addOrRemoveAdmin.useMutation({
      onSuccess: () => {
        utils.userRouter.fetch.invalidate();
        utils.userRouter.fetchForAdmin.invalidate();
      },
    });
  const onConfirm = async () => {
    await mutateAsync({
      id: account.id,
      admin: !account.admin,
    });
    onClose();
  };
  const disabled = isLoading || isSuccess;
  return (
    <div className="space-y-3">
      <p className="text-blueGray-700 text-lg text-center">{confirmText}</p>
      <div className="flex space-x-3 justify-center">
        <button
          className="bg-gray-500 px-3 py-1 rounded-md text-white self-end"
          onClick={onReturn}
        >
          {t("action.cancel")}
        </button>
        <button
          className={`${
            disabled ? "bg-gray-400" : "hover:bg-red-400 bg-red-500"
          } px-3 py-1 rounded-md text-white self-end`}
          onClick={onConfirm}
          disabled={disabled}
        >
          {t("action.confirm")}
        </button>
      </div>
    </div>
  );
};
