import { z } from "zod"

import { normalizeText } from "./helpers"
import { requiredText } from "./zod-helpers"

export const loginSchema = z.object({
  userType: requiredText({
    requiredMessage: "نوع المستخدم مطلوب",
  }),
  email: z.string().superRefine((value, ctx) => {
    const normalized = normalizeText(value)

    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: "البريد الإلكتروني مطلوب",
      })
      return
    }

    const emailValidation = z.string().email().safeParse(normalized)

    if (!emailValidation.success) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل بريدًا إلكترونيًا صالحًا",
      })
    }
  }),
  password: requiredText({
    min: 1,
    requiredMessage: "كلمة المرور مطلوبة",
  }),
})

export type LoginFormValues = z.input<typeof loginSchema>
