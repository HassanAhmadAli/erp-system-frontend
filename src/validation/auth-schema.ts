import { z } from "zod"

import i18n from "@/i18n"
import { normalizeText } from "./helpers"

export const loginSchema = z.object({
  userType: z.string().superRefine((value, ctx) => {
    if (!normalizeText(value)) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:userTypeRequired"),
      })
    }
  }),
  email: z.string().superRefine((value, ctx) => {
    const normalized = normalizeText(value)

    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:emailRequired"),
      })
      return
    }

    const emailValidation = z.string().email().safeParse(normalized)

    if (!emailValidation.success) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:invalidEmail"),
      })
    }
  }),
  password: z.string().superRefine((value, ctx) => {
    if (!normalizeText(value)) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:passwordRequired"),
      })
    }
  }),
})

export type LoginFormValues = z.input<typeof loginSchema>
