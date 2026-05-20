import { toast } from "sonner";

/** v0.1 骨架版：僅顯示 UI 示意提示 */
export function showAdminPlaceholder(action?: string) {
  const detail = action ? `「${action}」` : "此操作";
  toast.info(`${detail}尚未啟用`, {
    description: "後台 v0.1 骨架版僅提供介面示意，尚未連接資料儲存。",
  });
}

export function formatAdminDate(date: string) {
  const [y, m, d] = date.split("-");
  if (!m || !d) return date;
  return `${y}/${Number(m)}/${Number(d)}`;
}
