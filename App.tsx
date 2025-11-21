import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TaskInput from './components/TaskInput';
import TodoItem from './components/TodoItem';
import EmptyState from './components/EmptyState';
import StatsWidget from './components/StatsWidget';
import { Todo, Priority, DailyMemory } from './types';
import { LayoutDashboard, CalendarDays, Star, CheckSquare } from 'lucide-react';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('smarttask-todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('smarttask-score');
    return saved ? parseInt(saved) : 0;
  });

  const [memories, setMemories] = useState<Record<string, DailyMemory>>(() => {
    const saved = localStorage.getItem('smarttask-memories');
    return saved ? JSON.parse(saved) : {};
  });

  const [filter, setFilter] = useState<'all' | 'today' | 'important' | 'completed'>('all');

  useEffect(() => {
    localStorage.setItem('smarttask-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('smarttask-score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('smarttask-memories', JSON.stringify(memories));
  }, [memories]);

  const level = Math.floor(score / 500) + 1;

  const addTodo = (todo: Todo) => {
    setTodos(prev => [todo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        // Update Score
        if (isCompleting) {
          setScore(s => s + (t.points || 0));
          return { ...t, completed: true, completedAt: Date.now() };
        } else {
          setScore(s => Math.max(0, s - (t.points || 0)));
          return { ...t, completed: false, completedAt: undefined };
        }
      }
      return t;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const saveMemory = (memory: DailyMemory) => {
    setMemories(prev => ({
      ...prev,
      [memory.date]: memory
    }));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'important') return todo.priority === Priority.HIGH && !todo.completed;
    if (filter === 'today') return !todo.completed; 
    return true;
  });

  // Calculate nav counts
  const counts = {
    all: todos.length,
    today: todos.filter(t => !t.completed).length,
    important: todos.filter(t => t.priority === Priority.HIGH && !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  const NavItem = ({ id, icon: Icon, label, count, active }: any) => (
    <button
      onClick={() => setFilter(id)}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
        active 
          ? 'bg-white/10 text-white shadow-md border border-white/10 font-medium backdrop-blur-md' 
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-500'}`} />
        <span>{label}</span>
      </div>
      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen pb-12">
      <Header score={score} level={level} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 shrink-0">
            <StatsWidget 
              todos={todos} 
              score={score} 
              level={level} 
              memories={memories}
              onSaveMemory={saveMemory}
            />
            
            <nav className="space-y-2 sticky top-24">
              <NavItem 
                id="all" 
                icon={LayoutDashboard} 
                label="All Tasks" 
                count={counts.all} 
                active={filter === 'all'} 
              />
              <NavItem 
                id="today" 
                icon={CalendarDays} 
                label="Active" 
                count={counts.today} 
                active={filter === 'today'} 
              />
              <NavItem 
                id="important" 
                icon={Star} 
                label="Important" 
                count={counts.important} 
                active={filter === 'important'} 
              />
              <NavItem 
                id="completed" 
                icon={CheckSquare} 
                label="Completed" 
                count={counts.completed} 
                active={filter === 'completed'} 
              />
              
              <div className="pt-4 px-1">
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-2xl p-5 text-white shadow-lg backdrop-blur-md">
                  <h4 className="font-semibold mb-2 text-sm">Pro Tip</h4>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    Complete high priority tasks to earn <span className="font-bold text-yellow-300">50 XP</span>. Don't let tasks go overdue or you risk a fine!
                  </p>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
               <h2 className="text-2xl font-bold text-white drop-shadow-md">
                {filter === 'all' && 'All Tasks'}
                {filter === 'today' && 'Active Tasks'}
                {filter === 'important' && 'Important'}
                {filter === 'completed' && 'Completed'}
               </h2>
               <p className="text-indigo-200/70 text-sm mt-1">
                 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </p>
            </div>

            <TaskInput onAdd={addTodo} />

            <div className="space-y-3">
              {filteredTodos.length > 0 ? (
                filteredTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;