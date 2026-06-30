import React from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Zap, GitMerge, Settings } from 'lucide-react';

export const TriggerNode = ({ data }) => (
  <div className="px-4 py-3 shadow-md rounded-xl bg-white dark:bg-neutral-900 border-2 border-indigo-500 w-64 transition-transform hover:-tranneutral-y-0.5">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
        <Zap className="w-4 h-4" />
      </div>
      <div className="font-bold text-sm text-neutral-900 dark:text-white">Trigger</div>
    </div>
    <div className="text-xs text-neutral-500 dark:text-neutral-400">
      {data.label || 'When keyword matches...'}
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500 border-2 border-white dark:border-neutral-900" />
  </div>
);

export const MessageNode = ({ data }) => (
  <div className="px-4 py-3 shadow-md rounded-xl bg-white dark:bg-neutral-900 border-2 border-emerald-500 w-64 transition-transform hover:-tranneutral-y-0.5">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-neutral-900" />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
        <MessageSquare className="w-4 h-4" />
      </div>
      <div className="font-bold text-sm text-neutral-900 dark:text-white">Send Message</div>
    </div>
    <div className="text-xs text-neutral-500 dark:text-neutral-400">
      {data.label || 'Send a WhatsApp template'}
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-neutral-900" />
  </div>
);

export const ConditionNode = ({ data }) => (
  <div className="px-4 py-3 shadow-md rounded-xl bg-white dark:bg-neutral-900 border-2 border-amber-500 w-64 transition-transform hover:-tranneutral-y-0.5">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500 border-2 border-white dark:border-neutral-900" />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
        <GitMerge className="w-4 h-4" />
      </div>
      <div className="font-bold text-sm text-neutral-900 dark:text-white">Condition</div>
    </div>
    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
      {data.label || 'If/Else routing'}
    </div>
    
    <div className="relative border-t border-neutral-100 dark:border-neutral-800 pt-2 mt-2">
      <div className="flex justify-between text-[10px] font-bold text-neutral-400 px-1">
        <span className="text-emerald-500">TRUE</span>
        <span className="text-rose-500">FALSE</span>
      </div>
      {/* Multiple sources for conditions */}
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-neutral-900" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} className="w-3 h-3 bg-rose-500 border-2 border-white dark:border-neutral-900" />
    </div>
  </div>
);

export const ActionNode = ({ data }) => {
  const actionType = data.actionType || 'route';
  const label = actionType === 'close' ? 'Close Chat' : 'Route to Human';

  return (
    <div className="px-4 py-3 shadow-md rounded-xl bg-white dark:bg-neutral-900 border-2 border-rose-500 w-64 transition-transform hover:-translate-y-0.5">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-rose-500 border-2 border-white dark:border-neutral-900" />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400">
          <Settings className="w-4 h-4" />
        </div>
        <div className="font-bold text-sm text-neutral-900 dark:text-white">System Action</div>
      </div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-rose-500 border-2 border-white dark:border-neutral-900" />
    </div>
  );
};

export const nodeTypes = {
  trigger: TriggerNode,
  message: MessageNode,
  condition: ConditionNode,
  action: ActionNode,
};
