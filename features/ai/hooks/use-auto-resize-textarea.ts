"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MAX_ROWS = 4;

export function useAutoResizeTextarea(
  value: string,
  maxRows: number = DEFAULT_MAX_ROWS,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const style = getComputedStyle(el);
    const lineHeight = Number.parseFloat(style.lineHeight) || 20;
    const paddingTop = Number.parseFloat(style.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
    const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom);
    const maxHeight = Math.ceil(
      lineHeight * maxRows + paddingTop + paddingBottom,
    );
    const nextHeight = Math.min(el.scrollHeight, maxHeight);

    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    setIsMultiline(nextHeight > singleLineHeight + 1);
  }, [maxRows]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return { textareaRef, isMultiline, resize };
}
