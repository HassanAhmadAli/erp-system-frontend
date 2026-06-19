import { BASE_URL } from "@/api/client"
export type LoginResponse = {
  access_token: string
  refresh_token: string
}


/** Path segments for POST /authentication/{role}/signin */
export const AUTH_USER_TYPES = [
  "store-manager",
  "manager",
  "accountant",
  "warehouse-worker",
  "cashier",
] as const

export type AuthUserType = (typeof AUTH_USER_TYPES)[number]

function formatLoginError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] }
    const message = parsed.message
    if (Array.isArray(message)) return message.join(", ")
    if (typeof message === "string") return message
  } catch {
    // body is plain text
  }
  return body.trim() || `Login failed (${status})`
}

export async function loginUser(
  userType: AuthUserType,
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${BASE_URL}/authentication/${userType}/signin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    }
  )

  const body = await response.text()

  if (!response.ok) {
    throw new Error(formatLoginError(response.status, body))
  }

  let data: LoginResponse
  try {
    data = JSON.parse(body) as LoginResponse
  } catch {
    throw new Error("Invalid JSON response from server")
  }

  if (!data.access_token?.trim() || !data.refresh_token?.trim()) {
    throw new Error("Server response missing access_token or refresh_token")
  }

  return data
}

export async function refreshTokens(
  refreshToken: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${BASE_URL}/authentication/refresh-tokens`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }
  )

  const body = await response.text()

  if (!response.ok) {
    throw new Error(formatLoginError(response.status, body))
  }

  return JSON.parse(body) as LoginResponse
}

export async function signOut(email: string, refreshToken: string) {
  const response = await fetch(`${BASE_URL}/authentication/signout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(formatLoginError(response.status, body))
  }
}
