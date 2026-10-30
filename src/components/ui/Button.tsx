import type { ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

const Button = ({
  type = 'button',
  isLoading = false,
  className = '',
  children,
  variant = 'primary',
  disabled,
  ...rest
}: ButtonProps) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(variants[variant], className)}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="spinner mr-2 h-4 w-4 border-[2px]" />
          Processando...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
