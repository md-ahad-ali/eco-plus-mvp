import type { ReactNode } from "react";

interface AsyncStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: ReactNode;
}

const AsyncState = ({ loading, error, onRetry, children }: AsyncStateProps) => {
  if (loading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading data...</div>;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>Could not load data: {error}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 font-medium underline">
            Try again
          </button>
        )}
      </div>
    );
  }
  return <>{children}</>;
};

export default AsyncState;
