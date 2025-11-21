import React from 'react';
import { Check, Trash2, ChevronDown, ChevronUp, Calendar, Zap } from 'lucide-react';
import { Todo, Priority } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdate }) => {
  
  const priorityColors = {
    [Priority.HIGH]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [Priority.MEDIUM]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    [Priority.LOW]: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const toggleSubtask = (subtaskId: string) => {
    const newSubtasks = todo.subtasks?.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate(todo.id, { subtasks: newSubtasks });
  };

  const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  return (
    <div className={`group backdrop-blur-md rounded-xl border transition-all duration-200 ${todo.completed ? 'bg-gray-900/20 border-white/5' : 'bg-gray-800/40 border-white/10 hover:border-primary/30 hover:bg-gray-800/60 hover:shadow-lg'}`}>
      {/* Main Task Row */}
      <div className="p-4 flex items-start gap-4">
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            todo.completed 
              ? 'bg-gradient-to-tr from-primary to-secondary border-transparent text-white shadow-sm scale-110' 
              : 'border-gray-500 hover:border-primary text-transparent'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-base font-medium truncate transition-all ${todo.completed ? 'text-gray-500 line-through decoration-gray-600' : 'text-gray-100'}`}>
              {todo.text}
            </h3>
            {todo.category && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-gray-700/50 text-gray-300 text-[10px] font-semibold uppercase tracking-wider border border-white/5">
                {todo.category}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${priorityColors[todo.priority]}`}>
              {todo.priority}
            </span>
            
            {/* XP Badge */}
            <div className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border transition-colors ${todo.completed ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
               <Zap className={`w-3 h-3 ${todo.completed ? 'fill-gray-500' : 'fill-amber-500'}`} />
               {todo.points} XP
            </div>

            <span className="flex items-center gap-1 hidden sm:flex text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
            
            {totalSubtasks > 0 && (
              <span className="text-gray-400 flex items-center gap-1">
                 • {completedSubtasks}/{totalSubtasks} steps
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onDelete(todo.id)}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtasks Progress Bar */}
      {totalSubtasks > 0 && !todo.completed && (
        <div className="h-1 w-full bg-gray-800">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Subtasks Accordion */}
      {(todo.isExpanded || totalSubtasks > 0) && (
        <div className={`px-4 pb-4 pt-1 border-t border-white/5 bg-black/20 rounded-b-xl ${todo.completed ? 'opacity-50' : ''}`}>
            <div className="space-y-2 mt-2">
                {todo.subtasks?.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 pl-2 group/sub">
                        <button
                            onClick={() => toggleSubtask(sub.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                sub.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-600 bg-transparent hover:border-green-500'
                            }`}
                        >
                            {sub.completed && <Check className="w-3 h-3" />}
                        </button>
                        <span className={`text-sm ${sub.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                            {sub.text}
                        </span>
                    </div>
                ))}
            </div>
            
            <button 
              onClick={() => onUpdate(todo.id, { isExpanded: !todo.isExpanded })}
              className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
               {todo.isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
        </div>
      )}
    </div>
  );
};

export default TodoItem;