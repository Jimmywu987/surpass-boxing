import { trpc } from "@/utils/trpc";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useNewsInputResolver } from "@/features/admin/schemas/useNewsInputResolver";
import { addNewsSchema } from "@/schemas/news/add";
import { FormTextInput } from "@/features/common/components/input/FormTextInput";
import useTranslation from "next-translate/useTranslation";
import { useS3Upload } from "next-s3-upload";
import { ExternalLinkIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { SubmitButton } from "@/features/common/components/buttons/SubmitButton";
import { UseDisclosureReturn } from "@chakra-ui/react";
import dynamic from "next/dynamic";

const EditorBlock = dynamic(
  () => import("@/features/admin/components/editor/EditorBlock"),
  {
    ssr: false,
  }
);

export const NewsForm = ({
  modalDisclosure,
}: {
  modalDisclosure: UseDisclosureReturn;
}) => {
  const { t } = useTranslation("news");
  const { uploadToS3 } = useS3Upload();
  const utils = trpc.useContext();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileDisplay, setFileDisplay] = useState("");
  const { onClose } = modalDisclosure;
  const newsInputFormMethods = useForm<z.infer<typeof addNewsSchema>>({
    resolver: useNewsInputResolver(),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: undefined,
      img: "image",
    },
  });
  const { mutateAsync, isLoading } = trpc.newsRouter.add.useMutation({
    onSuccess: () => {
      removeImage();
      newsInputFormMethods.reset();
      utils.newsRouter.fetch.invalidate();
      onClose();
    },
  });

  const { formState } = newsInputFormMethods;
  const onClickUploadImageHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const imageFile = event.target.files[0];
      setFileDisplay(URL.createObjectURL(imageFile));
      setUploadFile(imageFile);
    }
  };
  const removeImage = () => {
    setUploadFile(null);
    setFileDisplay("");
  };
  const handleFile = async (file: File) => {
    const { url } = await uploadToS3(file);
    return url;
  };
  const onSubmit = newsInputFormMethods.handleSubmit(async (data) => {
    const img = await handleFile(uploadFile as File);
    await mutateAsync({ ...data, img });
  });

  return (
    <FormProvider {...newsInputFormMethods}>
      <form className="flex flex-col space-y-2" onSubmit={onSubmit}>
        <h1 className="text-2xl text-theme-color text-center">
          {t("admin:add_news")}
        </h1>
        <FormTextInput type="text" name="title" label={t("title")} />
        <div className="border-2 border-gray-200 p-2 rounded">
          <EditorBlock name="content" />
        </div>
        <label className=" bg-gray-300 text-gray-700 rounded w-36 py-1 cursor-pointer ">
          <input
            onChange={onClickUploadImageHandler}
            accept="image/*"
            className="hidden"
            type="file"
          />
          <div className="flex items-center space-x-2 justify-center">
            <div>
              <span className="text-red-600">*</span>
              <span className="font-semibold">{t("admin:upload_image")}</span>
            </div>
            <ExternalLinkIcon />
          </div>
        </label>
        {!!fileDisplay && (
          <div
            onClick={removeImage}
            className="relative h-44 w-44 md:h-56 md:w-56 cursor-pointer"
          >
            <Image
              src={fileDisplay}
              className="object-contain"
              fill
              alt="uploaded-image"
            />
            <div className="absolute top-1 right-2">
              <SmallCloseIcon className="p-1 bg-white rounded-full text-blueGray-800 text-lg" />
            </div>
          </div>
        )}
        <SubmitButton
          type="submit"
          disabled={!fileDisplay || isLoading || !formState.isValid}
        >
          {t("common:action.confirm")}
        </SubmitButton>
      </form>
    </FormProvider>
  );
};
