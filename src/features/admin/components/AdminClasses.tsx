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
import { cn } from "@/utils/cn";
import { AdminSetOffDay } from "@/features/admin/components/AdminSetOffDay";

export const AdminClasses = () => {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const { time_slot_id } = router.query;
  const [classOptions, setClassOptions] = useState(
    !time_slot_id
      ? AdminClassesOptionEnums.REGULAR_CLASSES
      : AdminClassesOptionEnums.COMING_CLASSES
  );
  const [viewClassType, setViewClassType] = useState(false);
  return (
    <div className="flex md:justify-between w-full md:space-x-3">
      <div
        className={cn(
          "md:flex w-full flex-col space-y-3 md:w-9/12 ",
          !viewClassType ? "inline" : "hidden"
        )}
      >
        <button
          onClick={() => setViewClassType(true)}
          className="flex text-xl border border-gray-100 rounded px-2 md:hidden"
        >
          {t("action.view_class_type")}
        </button>
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
            <OptionButton
              buttonText={t("set_day_off")}
              currentValue={classOptions}
              optionValue={AdminClassesOptionEnums.SET_DAY_OFF}
              onClick={() =>
                setClassOptions(AdminClassesOptionEnums.SET_DAY_OFF)
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
          {classOptions === AdminClassesOptionEnums.SET_DAY_OFF && (
            <AdminSetOffDay />
          )}
        </div>
      </div>
      <div
        className={cn(
          "w-full md:w-3/12 md:z-20 space-y-2 md:space-y-0 ",
          viewClassType ? "block" : "hidden md:block"
        )}
      >
        <button
          onClick={() => setViewClassType(false)}
          className="flex text-xl border border-gray-100 rounded px-2 md:hidden"
        >
          {t("common:action.back")}
        </button>
        <AdminClassTypesSection />
      </div>
    </div>
  );
};
