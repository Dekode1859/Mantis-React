// Type declaration for Electron API (optional in browser context)
interface WindowState {
  maximized: boolean
}

interface ApiKeyStatus {
  configured: boolean
  last4: string | null
}

interface ElectronAPI {
  getPort: () => Promise<number>
  getWindowState?: () => Promise<WindowState>
  onWindowStateChange?: (callback: (state: WindowState) => void) => () => void
  minimizeWindow?: () => void
  toggleMaximizeWindow?: () => void
  closeWindow?: () => void
  getApiKeyStatus?: () => Promise<ApiKeyStatus>
  saveApiKey?: (key: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export function isElectron(): boolean {
  return typeof window !== "undefined" && typeof window.electronAPI !== "undefined"
}

export async function resolveBackendBaseUrl(): Promise<string> {
  // Server-side (SSR) - Vite uses import.meta.env
  if (typeof window === "undefined") {
    return import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"
  }

  // Electron app - use dynamic port
  if (isElectron()) {
    const port = await window.electronAPI!.getPort()
    return `http://127.0.0.1:${port}`
  }

  // Browser - Vite uses import.meta.env
  return import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"
}

