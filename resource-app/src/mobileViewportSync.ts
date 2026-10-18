let lastH = -1
let lastTop = -1
let lastW = -1
let lastTouch: boolean | null = null
let rafId: number | null = null

/** Sync mobile viewport CSS vars safely without thrashing the DOM */
export function syncMobileViewport() {
  if (typeof window === 'undefined') return

  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }

  rafId = requestAnimationFrame(() => {
    rafId = null
    const root = document.documentElement
    const vv = window.visualViewport
    const visibleH = Math.round(vv?.height ?? window.innerHeight)
    const offsetTop = Math.round(vv?.offsetTop ?? 0)
    const visibleW = Math.round(root.clientWidth || window.innerWidth)

    if (visibleH !== lastH) {
      lastH = visibleH
      root.style.setProperty('--app-vh', `${visibleH}px`)
    }
    if (offsetTop !== lastTop) {
      lastTop = offsetTop
      root.style.setProperty('--app-vv-top', `${offsetTop}px`)
    }
    if (visibleW !== lastW) {
      lastW = visibleW
      root.style.setProperty('--app-vw', `${visibleW}px`)
    }

    const touch =
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      window.matchMedia('(max-width: 1024px)').matches

    if (touch !== lastTouch) {
      lastTouch = touch
      root.classList.toggle('mobile-shell', touch)
    }
  })
}

export function installMobileViewportListeners() {
  syncMobileViewport()
  window.addEventListener('resize', syncMobileViewport, { passive: true })
  window.addEventListener('orientationchange', syncMobileViewport, { passive: true })
  window.addEventListener('pageshow', syncMobileViewport, { passive: true })

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    window.removeEventListener('resize', syncMobileViewport)
    window.removeEventListener('orientationchange', syncMobileViewport)
    window.removeEventListener('pageshow', syncMobileViewport)
  }
}

