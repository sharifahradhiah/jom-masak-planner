import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700 shadow-soft disabled:bg-terracotta-300',
  secondary:
    'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-600 shadow-soft disabled:bg-sage-300',
  outline:
    'bg-transparent border border-ink-300 text-ink-700 hover:bg-cream-200 active:bg-cream-300',
  ghost: 'bg-transparent text-ink-700 hover:bg-cream-200 active:bg-cream-300',
  subtle: 'bg-cream-200 text-ink-700 hover:bg-cream-300',
  danger: 'bg-transparent text-terracotta-600 hover:bg-terracotta-50 border border-terracotta-100',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-base px-5 py-3 gap-2 rounded-xl',
  icon: 'p-2.5 rounded-xl',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Component>
  );
}
