import useTranslation from "next-translate/useTranslation";

const GoogleMapEmbed = ({
  src,
  width,
  height,
}: {
  src: string;
  width: string;
  height: string;
}) => {
  return (
    <iframe
      src={src}
      width={width}
      height={height}
      loading="lazy"
      style={{ border: 0 }}
      allowFullScreen={true}
      aria-hidden="false"
      tabIndex={0}
    ></iframe>
  );
};
const LocationPage = () => {
  const { t } = useTranslation("location");

  return (
    <div className="space-y-2 text-white">
      <div className="space-y-4">
        <h1 className="text-3xl">{t("address")}</h1>
        <p className="text-xl">
          {t("boxing_address")}: {t("boxing_gym_address")}
        </p>
        <div className="">
          <GoogleMapEmbed
            src={
              "https:/" +
              "/www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d922.2348296622813!2d113.97109876900403!3d22.393644922050306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403fb3c837a1bdf%3A0xb395eddd7f6ef50a!2sMai%20Kei%20Industrial%20Building!5e0!3m2!1sen!2shk!4v1683997248107!5m2!1sen!2shk"
            }
            width="100%"
            height="400"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
