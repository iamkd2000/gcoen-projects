import React from 'react';
import { ClipboardList } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="bg-white/5 p-4 rounded-full mb-4 backdrop-blur-sm border border-white/5">
        <ClipboardList className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-1">All caught up!</h3>
      <p className="text-gray-400 max-w-xs mx-auto">
        You have no pending tasks. Use the input above to add a new task and organize your day.
      </p>
    </div>
  );
};

export default EmptyState;