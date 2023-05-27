import { FormTextInput } from "@/features/common/components/input/FormTextInput";

import { format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

import { trpc, RouterOutput } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { EditIcon } from "@chakra-ui/icons";
import { useFormContext } from "react-hook-form";
import { useS3Upload } from "next-s3-upload";
import { editAccountSchema } from "@/schemas/user/edit";
import { z } from "zod";
import { deleteFile } from "@/utils/s3Uploader";
import { ViewAccountEnums } from "@/features/common/enums/ViewAccountEnums";
import { cn } from "@/utils/cn";

type inferType = RouterOutput["userRouter"]["fetchUserById"];

export const EditAccountInfo = ({
  user,
  setView,
}: {
  user: Exclude<inferType, null>;
  setView: Dispatch<SetStateAction<ViewAccountEnums>>;
}) => {
  const { t } = useTranslation("common");

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileDisplay, setFileDisplay] = useState("");
  const { uploadToS3 } = useS3Upload();
  const util = trpc.useContext();
  const { update, data: session } = useSession();
  const { mutateAsync, isLoading } = trpc.userRouter.edit.useMutation({
    onSuccess: () => {
      util.userRouter.fetchUserById.invalidate();
      onClose();
    },
  });
  const { getValues, handleSubmit, reset, formState } =
    useFormContext<z.infer<ReturnType<typeof editAccountSchema>>>();

  const onClickUploadImageHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const imageFile = event.target.files[0];
      setFileDisplay(URL.createObjectURL(imageFile));
      setUploadFile(imageFile);
    }
  };
  const handleFile = async (file: File) => {
    const { url } = await uploadToS3(file);
    return url;
  };
  const onSubmit = handleSubmit(async (data) => {
    const updatedUser = {
      ...data,
      profileImg: uploadFile
        ? await handleFile(uploadFile as File)
        : data.profileImg,
    };
    await mutateAsync(updatedUser);
    if (uploadFile && user.profileImg !== "/default-profile-img.png") {
      await deleteFile(user.profileImg);
    }
    const { id, ...rest } = updatedUser;
    await update({
      ...session,
      user: { ...session?.user, ...rest },
    });
  });

  const onClose = () => {
    setView(ViewAccountEnums.NORMAL);
    reset({
      id: user.id,
      username: user.username,
      profileImg: user.profileImg,
      phoneNumber: user.phoneNumber,
    });
  };
  const disabled = formState.isSubmitting || isLoading;
  return (
    <form className="flex flex-col items-center space-y-6 w-full">
      <div className="flex">
        <div className="w-32 h-32 relative">
          <Image
            src={!!fileDisplay ? fileDisplay : getValues("profileImg")}
            alt="Account profile image"
            className="w-full h-full rounded-full object-cover"
            fill
          />
        </div>

        <label>
          <input
            onChange={onClickUploadImageHandler}
            accept="image/*"
            className="hidden"
            type="file"
          />
          <EditIcon className="cursor-pointer text-lg self-end" />
        </label>
      </div>

      <div className="space-y-2 w-full">
        <FormTextInput
          type="text"
          name="username"
          label={t("common:account.username")}
          defaultValue={getValues("username")}
        />
        <p className="text-gray-600">
          {t("account.email_address")}: {user.email}
        </p>
        <FormTextInput
          type="text"
          name="phoneNumber"
          label={t("common:account.phone_number")}
          defaultValue={getValues("phoneNumber")}
        />
        <p className="text-gray-600">
          {t("account.created_at")}:{" "}
          {format(new Date(user.createdAt), "yyyy-MM-dd")}
        </p>
      </div>
      <div className="flex space-x-3 self-end">
        <button
          className="bg-gray-500 px-3 py-1 rounded-md text-white self-end"
          onClick={onClose}
        >
          {t("admin:action.cancel")}
        </button>
        <button
          className={cn(
            "px-3 py-1 rounded-md text-white self-end",
            disabled ? "bg-gray-400" : "hover:bg-green-400 bg-green-500"
          )}
          onClick={onSubmit}
          disabled={disabled}
        >
          {t("admin:action.confirm")}
        </button>
      </div>
    </form>
  );
};
