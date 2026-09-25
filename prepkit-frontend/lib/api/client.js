const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";


// export async function apiFetch(path, options = {}) {
//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

//   const res = await fetch(`${API_URL}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...options.headers,
//     },
//     body: options.body ? JSON.stringify(options.body) : undefined,
//   });

//   const data = res.status === 204 ? null : await res.json().catch(() => null);

//   if (!res.ok) {
//     const message = data?.error?.message || "Something went wrong.";
//     throw new Error(message);
//   }

//   return data;
// }


export async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (res.status === 401 && typeof window !== "undefined") {
    // Expired or invalid session (brief Section 1: "sensible handling of
    // expired or invalid sessions") - clear the stale token and send the
    // user back to login instead of leaving them stuck on a broken page.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    const message = data?.error?.message || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}



export const authApi = {
  register: (name, email, password) =>
    apiFetch("/api/auth/register", { method: "POST", body: { name, email, password } }),
  login: (email, password) =>
    apiFetch("/api/auth/login", { method: "POST", body: { email, password } }),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch("/api/auth/me"),
};







// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// // Central place that knows how to call the backend. Every request auto-
// // attaches the JWT (if we have one) and throws a readable Error on failure,
// // so pages don't have to repeat fetch boilerplate.
// export async function apiFetch(path, options = {}) {
//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

//   const res = await fetch(`${API_URL}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...options.headers,
//     },
//     body: options.body ? JSON.stringify(options.body) : undefined,
//   });

//   const data = res.status === 204 ? null : await res.json().catch(() => null);

//   if (!res.ok) {
//     const message = data?.error?.message || "Something went wrong.";
//     throw new Error(message);
//   }

//   return data;
// }

// export const authApi = {
//   register: (name, email, password) =>
//     apiFetch("/api/auth/register", { method: "POST", body: { name, email, password } }),
//   login: (email, password) =>
//     apiFetch("/api/auth/login", { method: "POST", body: { email, password } }),
//   logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
//   me: () => apiFetch("/api/auth/me"),
// };