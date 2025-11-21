import React, { useState, useEffect, useRef } from 'react';
import { Trophy, TrendingUp, Calendar, AlertCircle, Target, Mail, Camera, Image as ImageIcon, Save, X, Aperture } from 'lucide-react';
import { Todo, DailyMemory } from '../types';

interface StatsWidgetProps {
  todos: Todo[];
  score: number;
  level: number;
  memories: Record<string, DailyMemory>;
  onSaveMemory: (memory: DailyMemory) => void;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ todos, score, level, memories, onSaveMemory }) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get today's date key
  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (memories[todayKey]) {
      setNote(memories[todayKey].note);
      setImage(memories[todayKey].image);
    } else {
      setNote('');
      setImage(undefined);
    }
  }, [memories, todayKey]);

  // Camera logic
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraOpen) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setIsCameraOpen(false);
          alert("Unable to access camera. Please check permissions.");
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally if using user-facing camera for mirror effect logic (optional, keeping simple here)
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        setIsCameraOpen(false);
      }
    }
  };

  // Helper to check date range
  const isInRange = (timestamp: number, days: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    // Reset hours to compare dates only
    const dateStart = new Date(date.setHours(0,0,0,0));
    const nowStart = new Date(now.setHours(0,0,0,0));
    
    if (days === 0) return dateStart.getTime() === nowStart.getTime();
    
    const diffTime = Math.abs(nowStart.getTime() - dateStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= days;
  };

  // Calculate stats based on view
  const getStats = () => {
    let rangeDays = 0;
    if (view === 'week') rangeDays = 7;
    if (view === 'month') rangeDays = 30;

    const completedInPeriod = todos.filter(t => t.completed && t.completedAt && isInRange(t.completedAt, rangeDays));
    const createdInPeriod = todos.filter(t => isInRange(t.createdAt, rangeDays));
    
    // For "Active/Remaining", it's complicated for past weeks. 
    // We'll simplify: Remaining = Active tasks created in this period.
    const activeInPeriod = createdInPeriod.filter(t => !t.completed);

    const pointsEarned = completedInPeriod.reduce((acc, t) => acc + (t.points || 0), 0);
    
    // "Fine" logic: Active tasks created > 24h ago
    const overdueTasks = todos.filter(t => !t.completed && (Date.now() - t.createdAt > 86400000));
    const potentialFine = overdueTasks.reduce((acc, t) => acc + (t.points || 0), 0);

    return {
      completed: completedInPeriod.length,
      remaining: activeInPeriod.length,
      pointsEarned,
      potentialFine,
      completionRate: (completedInPeriod.length + activeInPeriod.length) === 0 
        ? 0 
        : Math.round((completedInPeriod.length / (completedInPeriod.length + activeInPeriod.length)) * 100)
    };
  };

  const stats = getStats();
  const nextLevelScore = level * 500;
  const progressToNextLevel = Math.min(((score - ((level - 1) * 500)) / 500) * 100, 100);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveDailyMemory = () => {
    onSaveMemory({
      date: todayKey,
      note,
      image
    });
    setIsEditingMemory(false);
    setIsCameraOpen(false);
  };

  const handleSendReport = () => {
    const subject = `SmartTask Daily Update - ${new Date().toLocaleDateString()}`;
    const memoryNote = memories[todayKey]?.note || "No memory recorded for today.";
    
    const body = `
Daily Productivity Report 📅
-------------------------
Current Level: ${level}
Total Score: ${score} XP

Statistics (${view === 'day' ? 'Today' : view === 'week' ? 'This Week' : 'This Month'}):
- Tasks Completed: ${stats.completed}
- Tasks Remaining: ${stats.remaining}
- Rewards Earned: +${stats.pointsEarned} XP
- Efficiency: ${stats.completionRate}%

Daily Memory / Journal:
"${memoryNote}"
${memories[todayKey]?.image ? '(Image attached in app)' : ''}

${stats.potentialFine > 0 ? `⚠️ WARNING: You have ${stats.potentialFine} XP at risk due to overdue tasks. Complete them to avoid a fine!` : '✅ Excellent work! No overdue tasks.'}

Generated by SmartTask AI
`;

    const mailtoLink = `mailto:khomendradahake@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-5 mb-6 flex flex-col gap-6">
      {/* Header & Score */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Level</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{level}</span>
              <span className="text-sm text-indigo-300 font-medium">Novice Achiever</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-amber-400 font-bold">
              <Trophy className="w-5 h-5 fill-amber-400" />
              <span>{score} XP</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{500 - (score % 500)} XP to next level</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="w-full h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>

        {/* Stats Tabs */}
        <div className="flex bg-black/20 p-1 rounded-xl mb-4">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                view === v ? 'bg-gray-800/80 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <div className="flex items-center gap-2 text-indigo-300 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-semibold">Done</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-[10px] text-indigo-300/60">Tasks finished</p>
          </div>

          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <div className="flex items-center gap-2 text-orange-300 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold">Remaining</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.remaining}</p>
            <p className="text-[10px] text-orange-300/60">Active tasks</p>
          </div>

          <div className="col-span-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-between">
            <div>
               <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">Earnings</span>
              </div>
              <p className="text-xl font-bold text-white">+{stats.pointsEarned} XP</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-sm">
              <span className="text-xs font-bold text-emerald-400">{stats.completionRate}%</span>
            </div>
          </div>

          {/* "Fine" / Overdue Section */}
          {stats.potentialFine > 0 && (
            <div className="col-span-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-200">Penalty Risk</p>
                <p className="text-[10px] text-red-300/80 leading-tight mt-1">
                  Overdue tasks detected! Complete them to save <span className="font-bold">-{stats.potentialFine} XP</span>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Memory Section */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Camera className="w-4 h-4 text-pink-400" />
            Today's Memory
          </h4>
          {!isEditingMemory && (
            <button 
              onClick={() => setIsEditingMemory(true)}
              className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingMemory ? (
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-3">
             <textarea
               value={note}
               onChange={(e) => setNote(e.target.value)}
               placeholder="What was the highlight of your day?"
               className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none h-20"
             />
             
             {isCameraOpen ? (
                <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden border border-white/10 shadow-inner">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4 z-10">
                        <button onClick={capturePhoto} className="p-3 bg-white rounded-full text-black hover:bg-gray-200 transition-transform hover:scale-110 shadow-lg">
                            <Aperture className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsCameraOpen(false)} className="p-3 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-transform hover:scale-110 shadow-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
             ) : (
                image && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={image} alt="Memory" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setImage(undefined)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                  </div>
                )
             )}

             <div className="flex items-center justify-between pt-2 border-t border-white/5">
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
                    title="Upload Image"
                    disabled={isCameraOpen}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsCameraOpen(true)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
                    title="Take Photo"
                    disabled={isCameraOpen}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
               </div>
               <button 
                 onClick={saveDailyMemory}
                 className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs rounded-lg font-medium transition-colors"
                 disabled={isCameraOpen}
               >
                 <Save className="w-3 h-3" /> Save
               </button>
             </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            {memories[todayKey] ? (
              <div className="space-y-3">
                 {memories[todayKey].note && (
                   <p className="text-sm text-gray-300 italic">"{memories[todayKey].note}"</p>
                 )}
                 {memories[todayKey].image && (
                   <div className="rounded-lg overflow-hidden border border-white/10">
                     <img src={memories[todayKey].image} alt="Daily Memory" className="w-full h-32 object-cover" />
                   </div>
                 )}
                 {!memories[todayKey].note && !memories[todayKey].image && (
                   <p className="text-xs text-gray-500 text-center py-2">Empty memory.</p>
                 )}
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingMemory(true)}
                className="text-center py-6 text-gray-500 hover:text-gray-300 cursor-pointer transition-colors"
              >
                <p className="text-xs">Tap to add a note or photo</p>
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handleSendReport}
        className="w-full mt-2 group relative bg-white/5 border border-white/10 text-gray-300 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all active:scale-95"
      >
        <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Email Daily Report
      </button>
    </div>
  );
};

export default StatsWidget;