import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

type AppLogoProps = {
  className?: string
  size?: number
}

export function AppLogo({ className, size = 40 }: AppLogoProps) {
  const { t } = useTranslation("common")

  return (
    <img
      src="/logo.png"
      alt={t("appName")}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-2xl object-cover", className)}
    />
  )
}
