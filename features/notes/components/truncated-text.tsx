"use client";

import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TruncatedTextProps = {
  text: string;
  className?: string;
};

export function TruncatedText({ text, className }: TruncatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  const content = (
    <p ref={ref} className={cn("truncate", className)}>
      {text}
    </p>
  );

  if (!isTruncated) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent
        side="right"
        className="max-w-xs bg-[#0f0f17] text-white border-[#ffffff10]"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
