import { ReactNode } from "react";

export interface BaseAction {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface ButtonAction extends BaseAction {
  type: "button";
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export interface SearchAction {
  type: "search";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSort?: () => void;
  sortLabel?: string;
  disabled?: boolean;
}

export type SectionAction = ButtonAction | SearchAction;

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  actions?: SectionAction[];
  variant?: "default" | "compact";
  iconVariant?: "colored" | "neutral";
  className?: string;
}
