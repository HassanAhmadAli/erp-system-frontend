export type LoginResponse = {
  access_token: string
  refresh_token: string
}

const API_BASE_URL = "http://localhost:3000"

/** Path segments for POST /authentication/{role}/signin */
export const AUTH_USER_TYPES = [
  "store-manager",
  "manager",
  "accountant",
  "warehouse-worker",
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
    `${API_BASE_URL}/authentication/${userType}/signin`,
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
