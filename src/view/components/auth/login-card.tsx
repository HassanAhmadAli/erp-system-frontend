import { Lock, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/view/components/ui/button"
import { loginUser } from "@/services/auth-service"

export function LoginCard() {
  const [userType, setUserType] = useState("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginMessage, setLoginMessage] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const result = await loginUser(userType, email, password)
      setLoginMessage("تم تسجيل الدخول بنجاح")
      console.log("Access Token:", result.access_token)

      if (userType === "admin") {
        navigate("/dashboard")
      }
    } catch (error) {
      setLoginMessage("فشل تسجيل الدخول. يرجى التحقق من البيانات المدخلة.")
    }
  }

  return (
    <section className="w-full max-w-md rounded-[24px] bg-[var(--erp-card)] p-8 shadow-[var(--erp-shadow)]">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="text-center">
          <h1 className="text-2xl font-bold">مرحبًا بعودتك</h1>
          <p className="text-sm text-[var(--erp-muted)]">
            سجّل دخولك لمتابعة إدارة النظام
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--erp-top-bar)] text-white">
          ERP
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
      >
        <label className="block">
          <span className="mb-2 block text-right text-sm">نوع المستخدم</span>
          <select
            className="h-11 w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="admin"> admin</option>
            <option value="manager"> مدير</option>
            <option value="accountant">محاسب</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-right text-sm">
            البريد الالكتروني
          </span>
          <div className="flex items-center rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]">
            <input
              className="h-11 w-full bg-transparent text-right outline-none placeholder:text-[var(--erp-muted)]"
              placeholder="أدخل البريد الالكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-right text-sm">كلمة المرور</span>
          <div className="flex items-center rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]">
            <input
              type="password"
              className="h-11 w-full bg-transparent text-right outline-none placeholder:text-[var(--erp-muted)]"
              placeholder="•••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </label>

        <button
          type="submit"
          className="h-11 w-full rounded-2xl bg-[var(--erp-top-bar)] text-base text-white hover:bg-[color-mix(in_srgb,var(--erp-top-bar)_88%,#000)]"
        >
          تسجيل الدخول
        </button>
      </form>

      {loginMessage && (
        <p className="mt-4 text-center text-sm text-[var(--erp-muted)]">
          {loginMessage}
        </p>
      )}

      <p className="mt-4 text-center text-sm text-[var(--erp-muted)]">
        للدخول السريع للتصميم:{" "}
        <Link to="/dashboard" className="font-semibold text-[var(--erp-brand)]">
          متابعة بدون تسجيل
        </Link>
      </p>
    </section>
  )
}
