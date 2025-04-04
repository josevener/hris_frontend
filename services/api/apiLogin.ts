// export async function apiLogin(email: string, password: string) {
//   const response = await fetch("/api/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     credentials: "include",
//     body: JSON.stringify({ email, password }),
//   });

//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.message || "Login failed");
//   }

//   return data;
// }
