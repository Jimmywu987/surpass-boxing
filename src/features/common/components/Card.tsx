import { FC, ReactNode } from "react";

export const Card: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="shadow-2xl space-y-3 rounded-lg p-5 w-96">{children}</div>
  );
};
