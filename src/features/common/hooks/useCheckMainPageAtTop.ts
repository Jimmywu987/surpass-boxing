import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRouter } from "next/router";
import { useState } from "react";

export const useCheckMainPageAtTop = () => {
  const { scrollY } = useScroll();
  const [isTop, setIsTop] = useState(true); // add this line

  const router = useRouter();

  const { route } = router;
  const isHomePage = route === "/";
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isHomePage) {
      if (latest > 0) setIsTop(false);
      else setIsTop(true);
    }
  });

  return { isTop, isHomePage };
};
