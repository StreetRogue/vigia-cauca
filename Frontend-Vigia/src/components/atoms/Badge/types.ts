export type BadgeTone = "default" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: string;
  tone?: BadgeTone;
  className?: string;
}