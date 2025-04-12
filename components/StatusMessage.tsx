import React from "react";

interface StatusMessageProps {
  isLoading: boolean;
  errorMessage?: string | null;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  isLoading,
  errorMessage,
}) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-600">Loading...</h2>
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-medium text-red-600">{errorMessage}</h2>
        <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
      </div>
    );
  }

  return null;
};

export default StatusMessage;
