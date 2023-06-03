import useTranslation from "next-translate/useTranslation";

const TableItem = ({ info }: { info: string[] }) => {
  return (
    <tr className="text-lg h-12 bg-gray-900 text-gray-100 ">
      {info.map((item, index) => (
        <td
          className={`${index === 0 && "font-semibold"}  text-center`}
          key={index}
        >
          {item}
        </td>
      ))}
    </tr>
  );
};

const PricingPage = () => {
  const { t } = useTranslation("pricing");

  const content = [
    [t("classes:beginner"), "650", "1750", "3100"],
    [t("classes:intermediate"), "800", "2150", "3800"],
    [t("classes:advanced"), "950", "2550", "4550"],
    [
      t("pricing:validity_period"),
      `1 ${t("classes:month")}`,
      `3 ${t("classes:month")}`,
      `6 ${t("classes:month")}`,
    ],
  ];
  return (
    <div className="flex flex-col justify-center items-center pt-16 px-8 space-y-8">
      <div className="w-full h-28 flex justify-center items-center">
        <h1 className="text-4xl text-white font-semibold text-center border-b-4 border-b-theme-color pb-2">
          {t("price_list")}
        </h1>
      </div>
      <table className="pricing-table relative w-full ">
        <tbody className="">
          <tr className="bg-gray-900 md:text-xl ">
            <th className=" flex flex-col relative pricing-table-head ">
              <span className="self-end pt-1 pr-1 text-theme-color">
                {t("sessions")}
              </span>
              <span className="self-start pb-1 pl-1 text-gray-100">
                {t("admin:level")}
              </span>
            </th>
            <th className="text-theme-color">5</th>
            <th className="text-theme-color">15</th>
            <th className="text-theme-color">30</th>
          </tr>

          {content.map((row, index) => (
            <TableItem key={index} info={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricingPage;
