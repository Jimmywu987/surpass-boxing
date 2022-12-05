export const validateSignUpInput = (email: string, password: string) => {
  const validEmail = typeof email === "string" && email.trim() !== "";
  const validPassword =
    typeof password === "string" &&
    password.trim() !== "" &&
    password.trim().length >= 8;
  return validEmail && validPassword;
};
