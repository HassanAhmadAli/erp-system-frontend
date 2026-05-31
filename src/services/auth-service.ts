// export async function loginUser(
//   userType: string,
//   email: string,
//   password: string
// ) {
//   const myHeaders = new Headers()
//   myHeaders.append("Content-Type", "application/json")
//   myHeaders.append("User-Agent", "insomnia/12.5.0")

//   const raw = JSON.stringify({
//     email,
//     password,
//   })

//   const requestOptions: RequestInit = {
//     method: "POST",
//     headers: myHeaders,
//     body: raw,
//     redirect: "follow", // Explicitly typed as RequestRedirect
//   }

//   try {
//     const response = await fetch(
//       `http://localhost:3000/authentication/${userType}/signin`,
//       requestOptions
//     )
//     if (response.ok) {
//       const result = await response.json()
//       return result
//     } else {
//       throw new Error(`Login failed with status ${response.status}`)
//     }
//   } catch (error) {
//     console.error("Error during login", error)
//     throw error
//   }
// }
export type LoginResponse = {
  access_token: string
  refresh_token: string
}

export async function loginUser(
  userType: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `http://localhost:3000/authentication/${userType}/signin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.json()
}
