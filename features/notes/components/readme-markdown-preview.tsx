import { MarkdownWithMath } from "@/components/markdown-with-math";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ReadmeMarkdownPreviewProps = {
  content: string;
  reading?: boolean;
  className?: string;
};

export function ReadmeMarkdownPreview({
  content,
  reading = false,
  className,
}: ReadmeMarkdownPreviewProps) {
  return (
    <ScrollArea
      className={cn("h-full bg-[#0f0f17] @container/readme", className)}
    >
      <div
        className={cn(
          "readme-preview",
          reading
            ? "mx-auto w-full max-w-[min(76rem,calc(100%-2rem))] px-6 sm:px-8 lg:px-10 xl:px-12 py-8"
            : "p-6 prose prose-invert max-w-none",
        )}
      >
        <MarkdownWithMath variant="readme">
          {content || "_Nothing to preview yet._"}
        </MarkdownWithMath>
      </div>
    </ScrollArea>
  );
}
