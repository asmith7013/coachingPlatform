import type {
  TextSizeToken,
  TextColorToken,
  RadiusToken,
  ShadowToken,
  PaddingToken,
  BorderWidthToken,
  BorderStyleToken,
  FontWeightToken,
  GapToken,
  ComponentSizeToken
} from '@/lib/tokens/types';

// Common base props shared by many components
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Base props for interactive components
export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}

// Text styling props
export interface TextStyleProps {
  textSize?: TextSizeToken;
  textColor?: TextColorToken;
  weight?: FontWeightToken;
}

// Spacing props
export interface SpacingProps {
  padding?: PaddingToken;
  gap?: GapToken;
}

// Shape props
export interface ShapeProps {
  radius?: RadiusToken;
  shadow?: ShadowToken;
  border?: boolean;
  borderWidth?: BorderWidthToken;
  borderStyle?: BorderStyleToken;
}

// Field props
export interface FieldComponentProps extends BaseComponentProps, TextStyleProps, SpacingProps, ShapeProps {
  label?: string;
  helpText?: string;
  error?: string | boolean;
  required?: boolean;
  readOnly?: boolean;
}

// Button specific props
export interface ButtonStyleProps extends InteractiveComponentProps, TextStyleProps, SpacingProps, ShapeProps {
  intent?: 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning';
  appearance?: 'solid' | 'outline' | 'ghost';
  size?: ComponentSizeToken;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// Card component props
export interface CardStyleProps extends BaseComponentProps, SpacingProps, ShapeProps {
  variant?: 'default' | 'alt' | 'white' | 'transparent' | 'muted' | 'secondary';
}

// Alert component props
export interface AlertStyleProps extends BaseComponentProps, TextStyleProps, SpacingProps, ShapeProps {
  intent?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'danger';
  appearance?: 'solid' | 'alt' | 'outline';
  layout?: 'stacked' | 'responsive';
}

// Badge component props
export interface BadgeStyleProps extends BaseComponentProps, TextStyleProps, SpacingProps, ShapeProps {
  intent?: 'neutral' | 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning';
  appearance?: 'solid' | 'alt' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  rounded?: 'default' | 'full' | 'none';
}

// Spinner component props
export interface SpinnerStyleProps extends BaseComponentProps {
  size?: ComponentSizeToken;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  borderWidth?: BorderWidthToken;
  srText?: string;
}

// Toast component props
export interface ToastStyleProps extends BaseComponentProps, TextStyleProps, ShapeProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  position?: 'bottomRight' | 'topRight' | 'bottomLeft' | 'topLeft' | 'bottom' | 'top';
  onClose?: () => void;
  show?: boolean;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Empty state component props
export interface EmptyStateStyleProps extends BaseComponentProps, TextStyleProps, SpacingProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  variant?: 'default' | 'muted' | 'accent';
  align?: 'left' | 'center' | 'right';
} 