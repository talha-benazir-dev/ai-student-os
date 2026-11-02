import { cn } from "@/lib/utils";

export function chatComposerRowClass(isMultiline: boolean) {
  return cn("flex gap-2", isMultiline ? "items-end" : "items-center");
}

export const CHAT_COMPOSER_TEXTAREA_CLASS = cn(
  "min-h-9 max-h-24 flex-1 resize-none bg-transparent py-2 text-sm leading-5 text-white outline-none",
  "placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-50",
);

export const CHAT_COMPOSER_ATTACH_BUTTON_CLASS = cn(
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#ffffff10]",
  "bg-[#ffffff08] hover:bg-[#ffffff12] disabled:opacity-50",
);

export const CHAT_COMPOSER_SEND_BUTTON_CLASS = cn(
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
  "hover:bg-primary/90 disabled:opacity-40",
);
