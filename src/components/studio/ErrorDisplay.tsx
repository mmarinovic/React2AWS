'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorDisplayProps {
  errors: string[];
  onDismiss?: () => void;
}

export function ErrorDisplay({ errors, onDismiss }: ErrorDisplayProps) {
  if (errors.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">
            {errors.length === 1 ? 'Parsing Error' : `${errors.length} Parsing Errors`}
          </p>
          <ul className="mt-1 space-y-1">
            {errors.map((error, i) => (
              <li key={i} className="text-xs text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
