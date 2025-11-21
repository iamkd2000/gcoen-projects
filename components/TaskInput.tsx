import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Priority, Todo } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskInputProps {
  onAdd: (todo: Todo) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [input, setInput] = useState('');
  const [manualPriority, setManualPriority] = useState<Priority>(Priority.MEDIUM);

  const getPointsForPriority = (priority: Priority): number => {
    switch (priority) {
      case Priority.HIGH: return 50;
      case Priority.MEDIUM: return 30;
      case Priority.LOW: return 10;
      default: return 10;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const title = input;
    const priority = manualPriority;
    const category = 'General';

    const newTodo: Todo = {
      id: uuidv4(),
      text: title,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
      subtasks: [],
      points: getPointsForPriority(priority)
    };

    onAdd(newTodo);
    setInput('');
    setManualPriority(Priority.MEDIUM); // Reset manual priority
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const currentPoints = getPointsForPriority(manualPriority);

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-4 mb-6 transition-all hover:shadow-2xl hover:shadow-primary/5">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a new task..."
                className="w-full pl-4 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-white placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Priority:</span>
                  <div className="flex bg-gray-800 rounded-lg p-0.5">
                    {(Object.values(Priority) as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setManualPriority(p)}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
                          manualPriority === p 
                            ? 'bg-gray-600 text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
               <Zap className="w-3 h-3 fill-amber-500" />
               +{currentPoints} XP
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;