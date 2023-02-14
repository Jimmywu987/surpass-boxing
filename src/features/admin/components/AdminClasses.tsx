import { Button, ButtonGroup } from "@chakra-ui/react";

import useTranslation from "next-translate/useTranslation";
import { useState } from "react";
import { AdminClassesOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { AdminClassTypesSection } from "@/features/admin/components/AdminClassTypesSection";
import { AdminInPastClass } from "@/features/admin/components/AdminInPastClass";
import { AdminRegularClass } from "@/features/admin/components/AdminRegularClass";
import { AdminRequestedClass } from "@/features/admin/components/AdminRequestedClass";

export const AdminClasses = () => {
  const { t } = useTranslation("admin");

  const [classOptions, setClassOptions] = useState(
    AdminClassesOptionEnums.REGULAR_CLASSES
  );
  return (
    <div className="flex justify-between flex-1 px-6 space-x-3">
      <div className="flex flex-col space-y-3 w-9/12">
        <div className="border-b border-b-gray-600 py-3">
          <ButtonGroup gap="2">
            <Button
              colorScheme="whiteAlpha"
              variant={
                classOptions === AdminClassesOptionEnums.REGULAR_CLASSES
                  ? "solid"
                  : "outline"
              }
              onClick={() =>
                setClassOptions(AdminClassesOptionEnums.REGULAR_CLASSES)
              }
            >
              {t("regular_class")}
            </Button>
            <Button
              colorScheme="whiteAlpha"
              variant={
                classOptions === AdminClassesOptionEnums.COMING_CLASSES
                  ? "solid"
                  : "outline"
              }
              onClick={() =>
                setClassOptions(AdminClassesOptionEnums.COMING_CLASSES)
              }
            >
              {t("classes")}
            </Button>
            <Button
              colorScheme="whiteAlpha"
              variant={
                classOptions === AdminClassesOptionEnums.CLASSES_IN_PAST
                  ? "solid"
                  : "outline"
              }
              onClick={() =>
                setClassOptions(AdminClassesOptionEnums.CLASSES_IN_PAST)
              }
            >
              {t("classes_in_past")}
            </Button>
          </ButtonGroup>
        </div>
        <div>
          {classOptions === AdminClassesOptionEnums.REGULAR_CLASSES && (
            <AdminRegularClass />
          )}
          {classOptions === AdminClassesOptionEnums.COMING_CLASSES && (
            <AdminRequestedClass />
          )}
          {classOptions === AdminClassesOptionEnums.CLASSES_IN_PAST && (
            <AdminInPastClass />
          )}
        </div>
      </div>
      <div className="w-3/12">
        <AdminClassTypesSection />
      </div>
    </div>
  );
};
