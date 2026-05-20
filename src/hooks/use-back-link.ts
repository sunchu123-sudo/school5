import { useLocation } from "react-router-dom";

export function useBackLink(defaultPath = "/") {
  const location = useLocation();
  const backTo = (location.state as { from?: string } | null)?.from ?? defaultPath;
  const backLabel =
    backTo === "/more" ? "返回更多" : backTo === "/" ? "返回首頁" : "返回";
  return { backTo, backLabel };
}
