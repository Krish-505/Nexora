import apiClient from './apiClient'

/**
 * Authenticate user and obtain JWT.
 * POST /auth/login
 * @returns {{ accessToken: string, user: object }}
 */
export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

/**
 * Fetch the currently authenticated user's profile.
 * GET /auth/me  (or /auth/profile — adjust to match backend)
 * The JWT is automatically attached by the Axios interceptor.
 */
export async function getProfile() {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export async function logout() {
  const response = await apiClient.post('/auth/logout')
  return response.data
}
