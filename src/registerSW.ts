/** 僅在 production 註冊 service worker，避免開發環境快取干擾 */
export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.warn("Service Worker 註冊失敗：", error);
    });
  });
}
