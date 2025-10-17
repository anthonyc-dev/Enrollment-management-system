export const passwordRules = [
  {
    label: "At least 6 characters",
    test: (val?: string) => (val?.length ?? 0) >= 6,
    zod: (val?: string) =>
      (val?.length ?? 0) >= 6 || "Password must be at least 6 characters",
  },
  {
    label: "At most 16 characters long",
    test: (val?: string) => (val?.length ?? 0) <= 16,
    zod: (val?: string) =>
      (val?.length ?? 0) <= 16 || "Password must be at most 16 characters",
  },
  {
    label: "Contains uppercase letter",
    test: (val?: string) => !!val && /[A-Z]/.test(val),
    zod: (val?: string) =>
      (!!val && /[A-Z]/.test(val)) ||
      "Must contain at least one uppercase letter",
  },
  {
    label: "Contains lowercase letter",
    test: (val?: string) => !!val && /[a-z]/.test(val),
    zod: (val?: string) =>
      (!!val && /[a-z]/.test(val)) ||
      "Must contain at least one lowercase letter",
  },
  {
    label: "Contains number",
    test: (val?: string) => !!val && /[0-9]/.test(val),
    zod: (val?: string) =>
      (!!val && /[0-9]/.test(val)) || "Must contain at least one number",
  },
  {
    label: "Contains special character",
    test: (val?: string) => !!val && /[!@#$%^&*(),.?":{}|<>]/.test(val),
    zod: (val?: string) =>
      (!!val && /[!@#$%^&*(),.?":{}|<>]/.test(val)) ||
      "Must contain at least one special character",
  },
];
