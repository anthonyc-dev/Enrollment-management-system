import { z } from "zod";
import { passwordRules } from "./passwordRules";

//register
export const registerSchema = z
  .object({
    schoolId: z
      .string()
      .min(1, "School ID is required")
      .regex(/^\d{2}-\d{4}$/, "School ID must be in the format 00-0000"),
    firstName: z.string().min(1, "Full name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .refine((val) => passwordRules.every((rule) => rule.test(val)), {
        message: "Password does not meet all requirements",
      })
      .superRefine((val, ctx) => {
        for (const rule of passwordRules) {
          const result = rule.zod(val);
          if (result !== true) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: result,
            });
          }
        }
      }),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    nda: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Non-Disclosure Agreement",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;

//log in
export const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
