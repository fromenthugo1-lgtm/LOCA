import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-brand text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover",
        secondary: "border border-line bg-surface text-ink hover:border-[#CBD5E1] hover:bg-canvas",
        ghost: "text-ink hover:bg-ink/5",
        onDark: "bg-white text-night hover:bg-[#E8EEF9]",
        onDarkGhost: "border border-night-line text-white hover:bg-white/5",
        danger: "bg-danger text-white hover:bg-[#B91C1C]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4 md:h-10",
        lg: "h-12 px-5 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ComponentProps<"button"> & ButtonVariantProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ className, variant, size, ...props }: ComponentProps<typeof Link> & ButtonVariantProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
