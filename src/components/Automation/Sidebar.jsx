import React from 'react';
import { MessageSquare, Zap, GitMerge, GripVertical, Settings } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full md:w-72 bg-white dark:bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 p-4 md:p-6 flex flex-col md:h-full shadow-sm z-10 shrink-0 overflow-x-auto md:overflow-visible">
      <div className="mb-4 md:mb-6 shrink-0">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Nodes</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 hidden md:block">Drag and drop to build your flow.</p>
      </div>
      
      <div className="flex flex-row md:flex-col gap-3 min-w-max pb-2 md:pb-0">
        {/* Trigger Node */}
        <div 
          className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 flex items-center gap-3 cursor-grab hover:border-indigo-500 hover:shadow-sm transition-all min-w-[160px] md:min-w-0"
          onDragStart={(event) => onDragStart(event, 'trigger', 'Incoming Message')}
          draggable
        >
          <GripVertical className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="p-1.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Trigger</span>
        </div>

        {/* Message Node */}
        <div 
          className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 flex items-center gap-3 cursor-grab hover:border-emerald-500 hover:shadow-sm transition-all min-w-[160px] md:min-w-0"
          onDragStart={(event) => onDragStart(event, 'message', 'Send Message')}
          draggable
        >
          <GripVertical className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="p-1.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Send Message</span>
        </div>

        {/* Condition Node */}
        <div 
          className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 flex items-center gap-3 cursor-grab hover:border-amber-500 hover:shadow-sm transition-all min-w-[160px] md:min-w-0"
          onDragStart={(event) => onDragStart(event, 'condition', 'Check Condition')}
          draggable
        >
          <GripVertical className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="p-1.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 shrink-0">
            <GitMerge className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Condition</span>
        </div>
        {/* Action Node */}
        <div 
          className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 flex items-center gap-3 cursor-grab hover:border-rose-500 hover:shadow-sm transition-all min-w-[160px] md:min-w-0"
          onDragStart={(event) => onDragStart(event, 'action', 'System Action')}
          draggable
        >
          <GripVertical className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="p-1.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Action</span>
        </div>
      </div>
    </div>
  );
}
