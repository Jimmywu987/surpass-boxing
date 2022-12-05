import * as bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (plainPassword: string) => {
  const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hash;
};
export const checkPassword = async (
  plainPassword: string,
  hashPassword: string
) => {
  const match = await bcrypt.compare(plainPassword, hashPassword);
  return match;
};
