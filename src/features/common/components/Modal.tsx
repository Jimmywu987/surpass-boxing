import { UseDisclosureReturn } from "@chakra-ui/react";
import { useRef } from "react";

import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

export const ModalComponent = ({
  modalDisclosure,
  content,
}: {
  modalDisclosure: UseDisclosureReturn;
  content: React.ReactNode;
}) => {
  const router = useRouter();
  const { time_slot_id } = router.query;
  const { isOpen, onClose } = modalDisclosure;
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const onCloseModal = () => {
    onClose();
    if (!!time_slot_id) {
      router.push({}, undefined, { shallow: true });
    }
  };
  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onCloseModal}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <div className="m-6">{content}</div>
      </ModalContent>
    </Modal>
  );
};
