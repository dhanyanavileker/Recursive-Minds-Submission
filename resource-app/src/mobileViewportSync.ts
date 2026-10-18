/** Sync iOS-visible viewport CSS vars (safe to call before React hydrates). */
export function syncMobileViewport() {
  const root = document.documentElement
  const vv = window.visualViewport
  const visibleH = Math.round(vv?.height ?? window.innerHeight)
  const offsetTop = Math.round(vv?.offsetTop ?? 0)

  const visibleW = Math.round(document.documentElement.clientWidth)

  root.style.setProperty('--app-vh', `${visibleH}px`)
  root.style.setProperty('--app-vv-top', `${offsetTop}px`)
  root.style.setProperty('--app-vw', `${visibleW}px`)

  const touch =
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    window.matchMedia('(max-width: 1024px)').matches
  root.classList.toggle('mobile-shell', touch)
}

export function installMobileViewportListeners() {
  syncMobileViewport()
  const vv = window.visualViewport
  vv?.addEventListener('resize', syncMobileViewport)
  vv?.addEventListener('scroll', syncMobileViewport)
  window.addEventListener('resize', syncMobileViewport)
  window.addEventListener('orientationchange', syncMobileViewport)
  window.addEventListener('pageshow', syncMobileViewport)

  return () => {
    vv?.removeEventListener('resize', syncMobileViewport)
    vv?.removeEventListener('scroll', syncMobileViewport)
    window.removeEventListener('resize', syncMobileViewport)
    window.removeEventListener('orientationchange', syncMobileViewport)
    window.removeEventListener('pageshow', syncMobileViewport)
  }
}
