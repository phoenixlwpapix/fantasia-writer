import React from "react";
import { Loader2, Wand2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  icon,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px]";

  const variants = {
    primary: "bg-primary text-white hover:bg-black border border-transparent",
    secondary:
      "bg-white text-primary border border-border-strong hover:bg-gray-50",
    outline:
      "bg-transparent text-primary border border-border hover:bg-gray-50",
    ghost: "bg-transparent text-secondary hover:text-primary hover:bg-gray-50",
    accent: "bg-black text-white hover:opacity-90 border border-transparent",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-sm",
    md: "text-sm px-4 py-2 rounded-md",
    lg: "text-base px-6 py-3 rounded-md",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        icon && <span className="mr-2">{icon}</span>
      )}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  aiSuggest?: () => void;
  isAiLoading?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  aiSuggest,
  isAiLoading,
  className = "",
  ...props
}) => (
  <div className="space-y-1.5 w-full">
    <div className="flex justify-between items-center">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
          {label}
        </label>
      )}
      {aiSuggest && (
        <button
          onClick={aiSuggest}
          disabled={isAiLoading}
          className="text-[10px] uppercase tracking-wide text-secondary hover:text-primary flex items-center transition-colors"
        >
          {isAiLoading ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Wand2 className="w-3 h-3 mr-1" />
          )}
          AI 辅助
        </button>
      )}
    </div>
    <input
      className={`w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-primary placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${className}`}
      {...props}
    />
  </div>
);

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  aiSuggest?: () => void;
  isAiLoading?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  aiSuggest,
  isAiLoading,
  className = "",
  ...props
}) => (
  <div className="space-y-1.5 w-full">
    <div className="flex justify-between items-center">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
          {label}
        </label>
      )}
      {aiSuggest && (
        <button
          onClick={aiSuggest}
          disabled={isAiLoading}
          className="text-[10px] uppercase tracking-wide text-secondary hover:text-primary flex items-center transition-colors"
        >
          {isAiLoading ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Wand2 className="w-3 h-3 mr-1" />
          )}
          AI 辅助
        </button>
      )}
    </div>
    <textarea
      className={`w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-primary placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[100px] resize-y ${className}`}
      {...props}
    />
  </div>
);

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
}> = ({ children, className = "", title }) => (
  <div className={`bg-white border border-border rounded-lg p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-medium mb-4 text-primary">{title}</h3>
    )}
    {children}
  </div>
);

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
      variant === "default"
        ? "bg-black text-white"
        : "border border-gray-300 text-secondary"
    } ${className}`}
  >
    {children}
  </span>
);
