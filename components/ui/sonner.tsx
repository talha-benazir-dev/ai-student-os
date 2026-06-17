"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "nucleus-toast group toast",
          description: "nucleus-toast-description",
          actionButton: "nucleus-toast-action",
          cancelButton: "nucleus-toast-cancel",
          closeButton: "nucleus-toast-close",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
