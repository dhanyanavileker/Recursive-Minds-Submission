import { useEffect } from 'react'
import { installMobileViewportListeners } from './mobileViewportSync'

export function useMobileViewport() {
  useEffect(() => installMobileViewportListeners(), [])
}
