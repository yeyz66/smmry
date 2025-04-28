import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = value !== null ? Math.min(Math.max(value, 0), max) : 0;
    const progressPercentage = (percentage / max) * 100;

    return (
      <div
        ref={ref}
        className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className || ""}`}
        {...props}
      >
        <div
          className={`h-full w-full flex-1 transition-all ${indicatorClassName || "bg-blue-500"}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress"; 