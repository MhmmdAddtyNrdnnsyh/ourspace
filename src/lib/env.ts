const apiUrl = import.meta.env.VITE_API_URL?.trim()
  || import.meta.env.VITE_APPS_SCRIPT_URL?.trim()
  || '/api/apps-script'

export const appConfig = {
  apiUrl,
} as const
