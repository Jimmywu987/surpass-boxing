import { Button, ButtonGroup } from "@chakra-ui/react";

import useTranslation from "next-translate/useTranslation";
import { useState } from "react";
import { AdminClassesOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { AdminClassTypesSection } from "@/features/admin/components/AdminClassTypesSection";
import { AdminInPastClass } from "@/features/admin/components/AdminInPastClass";
import { AdminRegularClass } from "@/features/admin/components/AdminRegularClass";
import { AdminRequestedClass } from "@/features/admin/components/AdminRequestedClass";
import { OptionButton } from "@/features/common/components/buttons/OptionButton";
import { useRouter } from "next/router";

export const AdminClasses = () => {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { time_slot_id } = router.query;
  const [classOptions, setClassOptions] = useState(
    !time_slot_id
      ? AdminClassesOptionEnums.REGULAR_CLASSES
      : AdminClassesOptionEnums.COMING_CLASSES
  );
  return (
    <div className="flex justify-between flex-1 space-x-3">
      <div className="flex flex-col space-y-3 w-9/12">
        <div className="border-b border-b-gray-600 py-3">
          <ButtonGroup gap="2">
            <OptionButton
              buttonText={t("regular_class")}
              currentValue={classOptions}
              optionValue={AdminClassesOptionEnums.REGULAR_CLASSES}
              onClick={() =>
                setClassOptions(AdminClassesOptionEnums.REGULAR_CLASSES)
              }
            />
            <OptionButton
              buttonText={t("classes")}
              currentValue={classOptions}
              optionValue={AdminClassesOptionEnums.COMING_CLASSES}
              onClick={() =>
                setClassOptions(AdminClassesOptionEnums.COMING_CLASSES)
              }
            />
            <OptionButton
              buttonText={t("classes_in_past")}
              currentValue={classOptions}
              optionValue={AdminClassesOptionEnums.CLASSES_IN_PAST}
              onClick={() =>
                setClassOptions(AdminClassesOptionEnums.CLASSES_IN_PAST)
              }
            />
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
      <div className="w-3/12 z-20">
        <AdminClassTypesSection />
      </div>
    </div>
  );
};
