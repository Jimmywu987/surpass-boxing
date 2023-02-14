import { useRef } from "react";
import { AdminPageProps } from "@/pages/admin";
import { Button, useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { subDays, endOfDay, format } from "date-fns";
import useTranslation from "next-translate/useTranslation";

import { SignUpForm } from "@/features/signUp/components/SignUpForm";
import { LoginForm } from "@/features/login/components/LoginForm";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";

export const ModalComponent = ({
  modalDisclosure,
  content,
}: {
  modalDisclosure: UseDisclosureReturn;
  content: React.ReactNode;
}) => {
  const { isOpen, onClose } = modalDisclosure;
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <div className="m-6">{content}</div>
      </ModalContent>
    </Modal>
  );
};
