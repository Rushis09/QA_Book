import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "qabook_report_focus";

function focusText(type: string, id: string) {
  if (type === "execution") return [id, `EX-${id}`];
  return [id];
}

function findTarget(values: string[]) {
  const rows = Array.from(document.querySelectorAll("tr"));
  const normalizedValues = values.map((value) => value.trim().toLowerCase());

  const row = rows.find((candidate) => {
    const cells = Array.from(candidate.querySelectorAll("td"));
    const text = candidate.textContent?.trim().toLowerCase() || "";

    return normalizedValues.some((value) =>
      cells.some((cell) => cell.textContent?.trim().toLowerCase() === value),
    ) || normalizedValues.some((value) => text.split(/\s+/).includes(value));
  });

  if (row) return row as HTMLElement;

  const candidates = Array.from(document.querySelectorAll("[data-record-id]"));
  return candidates.find((element) =>
    normalizedValues.includes(
      element.getAttribute("data-record-id")?.trim().toLowerCase() || "",
    ),
  ) as HTMLElement | undefined;
}

export default function ReportFocusBridge() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("focus_type");
    const id = params.get("focus_id");

    if (!type || !id) return;

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ type, id }),
    );

    let attempts = 0;
    let target: HTMLElement | undefined;

    const applyFocus = () => {
      attempts += 1;
      target = findTarget(focusText(type, id));

      if (!target && attempts < 20) return;
      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const previous = target.style.cssText;
      target.style.backgroundColor = "#eef4ff";
      target.style.boxShadow = "inset 3px 0 0 #356dff, 0 0 0 2px #c7d7ff";
      target.style.transition = "background-color 180ms ease, box-shadow 180ms ease";

      window.setTimeout(() => {
        if (target) {
          target.style.cssText = previous;
        }
      }, 5000);
    };

    const timer = window.setInterval(() => {
      applyFocus();
      if (target || attempts >= 20) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [location.pathname, location.search]);

  return null;
}
