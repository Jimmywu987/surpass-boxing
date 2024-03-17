import { registerServiceWorker } from "@/services/notification/serviceWorker";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const useServiceWorker = () => {
  const session = useSession();
  const user = session.data?.user as User;

  useEffect(() => {
    (async () => {
      try {
        await registerServiceWorker();
      } catch (error) {}
    })();
    return () => {};
  }, []);
};
