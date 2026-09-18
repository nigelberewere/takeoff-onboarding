import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  icon: Icon,
  actionButton,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-xs sm:text-sm font-medium text-slate-300">
          {label} {required && <span className="text-brand-500 font-bold">*</span>}
        </label>
        {actionButton && (
          <button
            type="button"
            onClick={actionButton.onClick}
            className="text-[11px] font-medium text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
          >
            {actionButton.label}
          </button>
        )}
      </div>

      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          required={required}
          className={`logistics-input ${Icon ? 'pl-10' : 'pl-4'} ${
            error
              ? 'border-rose-500/80 focus:ring-rose-500/30 focus:border-rose-500'
              : 'border-slate-800 focus:border-brand-500'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-400 flex items-center space-x-1 mt-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
