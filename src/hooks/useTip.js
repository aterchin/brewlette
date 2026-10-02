import { useCallback, useState } from "react";

const TIPS_KEY = "brewlette.tips.v1";

function readSeenTips() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TIPS_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * One-time guided tip, remembered per device.
 * Returns [visible, dismiss]; dismissing hides it for good.
 */
export function useTip(id) {
  const [seen, setSeen] = useState(() => readSeenTips().includes(id));

  const dismiss = useCallback(() => {
    setSeen(true);
    const tips = readSeenTips();
    if (tips.includes(id)) return;
    try {
      localStorage.setItem(TIPS_KEY, JSON.stringify([...tips, id]));
    } catch {
      // Private mode or full storage: the tip just shows again next visit.
    }
  }, [id]);

  return [!seen, dismiss];
}
