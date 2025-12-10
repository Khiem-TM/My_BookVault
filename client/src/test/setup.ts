import '@testing-library/jest-dom'

if (typeof window !== 'undefined' && !('localStorage' in window)) {
  const store: Record<string,string> = {}
  // @ts-ignore
  window.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] }
  }
}
