import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { RefreshCw, ArrowRight, X, Smartphone, Image as ImageIcon, Video, FileText, Type, Plus, Trash2, Link, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function TemplateBuilder({ onCancel, onSuccess }) {
  const { API_URL } = useAuth();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en_US');
  
  const [headerType, setHeaderType] = useState('NONE'); // NONE, TEXT, IMAGE, VIDEO, DOCUMENT
  const [headerText, setHeaderText] = useState('');
  
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  
  const [buttons, setButtons] = useState([]); // { type, text, url, phone_number }

  const createMutation = useMutation({
    mutationFn: async () => {
      const components = [];
      
      // Header
      if (headerType === 'TEXT' && headerText.trim()) {
        components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
      } else if (headerType !== 'NONE' && headerType !== 'TEXT') {
        components.push({ type: 'HEADER', format: headerType });
      }
      
      // Body
      if (body.trim()) {
        components.push({ type: 'BODY', text: body });
      }
      
      // Footer
      if (footer.trim()) {
        components.push({ type: 'FOOTER', text: footer });
      }
      
      // Buttons
      if (buttons.length > 0) {
        const mappedButtons = buttons.map(b => {
          if (b.type === 'QUICK_REPLY') return { type: 'QUICK_REPLY', text: b.text };
          if (b.type === 'URL') return { type: 'URL', text: b.text, url: b.url };
          if (b.type === 'PHONE_NUMBER') return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phone_number };
          return null;
        }).filter(Boolean);
        if (mappedButtons.length > 0) {
          components.push({ type: 'BUTTONS', buttons: mappedButtons });
        }
      }

      const payload = {
        name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        category,
        language,
        components
      };

      const res = await axios.post(`${API_URL}/templates`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Template submitted to Meta for review!');
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to submit template');
    }
  });

  const handleSave = () => {
    if (!name || !body) {
      toast.error('Template Name and Body are required.');
      return;
    }
    createMutation.mutate();
  };

  const addButton = (type) => {
    if (buttons.length >= 3) {
      toast.error('Maximum 3 buttons allowed');
      return;
    }
    setButtons([...buttons, { type, text: '', url: '', phone_number: '' }]);
  };

  const updateButton = (index, field, value) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };

  const removeButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const renderPreviewText = (text) => {
    let preview = text || '';
    // Highlight variables
    preview = preview.replace(/\{\{\d+\}\}/g, (match) => `[Variable]`);
    return preview;
  };

  return (
    <div className="flex h-full bg-neutral-50 dark:bg-black overflow-hidden relative w-full absolute inset-0 z-50">
      
      {/* Scrollable Builder Form */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32">
          
          <button 
            onClick={onCancel}
            className="flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </button>
          
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Create Professional Template</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Design an advanced WhatsApp template utilizing 100% of Meta API features.</p>
          
          <div className="space-y-8">
            
            {/* 1. Basic Details */}
            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">1. General Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Template Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. spring_sale_alert"
                    className="input-field w-full bg-neutral-50 dark:bg-black font-mono text-sm"
                    disabled={createMutation.isPending}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-full bg-neutral-50 dark:bg-black" disabled={createMutation.isPending}>
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utility</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Language</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field w-full bg-neutral-50 dark:bg-black" disabled={createMutation.isPending}>
                      <option value="en_US">English (US)</option>
                      <option value="es_ES">Spanish (Spain)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Header */}
            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">2. Header <span className="text-sm font-normal text-neutral-400">(Optional)</span></h3>
              </div>
              <div className="flex gap-2 mb-4 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-max">
                {[
                  { id: 'NONE', label: 'None', icon: null },
                  { id: 'TEXT', label: 'Text', icon: Type },
                  { id: 'IMAGE', label: 'Image', icon: ImageIcon },
                  { id: 'VIDEO', label: 'Video', icon: Video },
                  { id: 'DOCUMENT', label: 'Document', icon: FileText }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setHeaderType(type.id)}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors",
                      headerType === type.id 
                        ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm" 
                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    )}
                  >
                    {type.icon && <type.icon className="w-3.5 h-3.5" />} {type.label}
                  </button>
                ))}
              </div>

              {headerType === 'TEXT' && (
                <div>
                  <input 
                    type="text" 
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value.substring(0, 60))}
                    placeholder="Enter header text (max 60 chars)"
                    className="input-field w-full bg-neutral-50 dark:bg-black"
                  />
                  <div className="text-xs text-neutral-500 text-right mt-1">{headerText.length}/60</div>
                </div>
              )}
              {headerType !== 'NONE' && headerType !== 'TEXT' && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                    {headerType === 'IMAGE' && <ImageIcon className="w-5 h-5" />}
                    {headerType === 'VIDEO' && <Video className="w-5 h-5" />}
                    {headerType === 'DOCUMENT' && <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Media Header Selected</h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400/70 mt-1">
                      During actual campaign dispatch, you will upload the specific {headerType.toLowerCase()} file.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Body */}
            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">3. Body <span className="text-sm font-normal text-rose-500">*</span></h3>
              <textarea 
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hi {{1}}, your order {{2}} is ready!..."
                className="input-field w-full resize-none bg-neutral-50 dark:bg-black leading-relaxed"
                disabled={createMutation.isPending}
              ></textarea>
              <p className="text-xs text-neutral-500 mt-2">Use {'{{1}}, {{2}}'} to add dynamic variables. (Max 1024 chars)</p>
            </div>

            {/* 4. Footer */}
            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">4. Footer <span className="text-sm font-normal text-neutral-400">(Optional)</span></h3>
              <input 
                type="text" 
                value={footer}
                onChange={(e) => setFooter(e.target.value.substring(0, 60))}
                placeholder="e.g. Reply STOP to unsubscribe"
                className="input-field w-full bg-neutral-50 dark:bg-black"
              />
              <p className="text-xs text-neutral-500 mt-2">Short grey text at the bottom. (Max 60 chars)</p>
            </div>

            {/* 5. Buttons */}
            <div className="card p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">5. Buttons <span className="text-sm font-normal text-neutral-400">(Optional)</span></h3>
                <div className="text-xs text-neutral-500">{buttons.length}/3 Added</div>
              </div>
              
              <div className="space-y-3 mb-4">
                {buttons.map((btn, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-[#111B21] border border-neutral-200 dark:border-neutral-800 rounded-lg relative group">
                    <button onClick={() => removeButton(idx)} className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-rose-500 bg-white dark:bg-neutral-900 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 w-24 shrink-0">{btn.type.replace('_', ' ')}</span>
                      <input 
                        type="text"
                        placeholder="Button Text (e.g. Visit Website)"
                        value={btn.text}
                        onChange={(e) => updateButton(idx, 'text', e.target.value.substring(0, 25))}
                        className="input-field w-full py-1.5 text-sm bg-white dark:bg-neutral-900"
                      />
                    </div>
                    {btn.type === 'URL' && (
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 w-24 shrink-0">URL</span>
                         <input 
                            type="text"
                            placeholder="https://..."
                            value={btn.url}
                            onChange={(e) => updateButton(idx, 'url', e.target.value)}
                            className="input-field w-full py-1.5 text-sm bg-white dark:bg-neutral-900 font-mono"
                          />
                      </div>
                    )}
                    {btn.type === 'PHONE_NUMBER' && (
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 w-24 shrink-0">Phone</span>
                         <input 
                            type="text"
                            placeholder="+1234567890"
                            value={btn.phone_number}
                            onChange={(e) => updateButton(idx, 'phone_number', e.target.value)}
                            className="input-field w-full py-1.5 text-sm bg-white dark:bg-neutral-900 font-mono"
                          />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {buttons.length < 3 && (
                <div className="flex gap-2">
                  <button onClick={() => addButton('QUICK_REPLY')} className="px-3 py-1.5 text-xs font-semibold rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5">
                    <Plus className="w-3 h-3"/> Quick Reply
                  </button>
                  <button onClick={() => addButton('URL')} className="px-3 py-1.5 text-xs font-semibold rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5">
                    <Link className="w-3 h-3"/> URL
                  </button>
                  <button onClick={() => addButton('PHONE_NUMBER')} className="px-3 py-1.5 text-xs font-semibold rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5">
                    <Phone className="w-3 h-3"/> Call
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex gap-4">
              <button onClick={onCancel} className="btn-secondary px-8 py-3 bg-white dark:bg-neutral-900 text-base shadow-sm border border-neutral-200 dark:border-neutral-800">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!name || !body || createMutation.isPending} className="btn-primary flex-1 py-3 flex items-center justify-center disabled:opacity-50 text-base font-semibold shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-none">
                {createMutation.isPending ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <ArrowRight className="w-5 h-5 mr-2" />}
                Submit to Meta for Review
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Static Phone Preview Side */}
      <div className="w-[400px] xl:w-[450px] bg-neutral-100 dark:bg-[#0B141A] border-l border-neutral-200 dark:border-[#202C33] p-4 md:p-8 flex flex-col items-center justify-center shrink-0 shadow-[inset_20px_0_20px_-20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-medium mb-6">
          <Smartphone className="w-5 h-5" /> Live Device Preview
        </div>
        
        <div className="w-[320px] h-[650px] bg-black rounded-[45px] shadow-2xl p-3 relative border-[6px] border-neutral-800 shrink-0">
          <div className="w-full h-full bg-[#EFEAE2] dark:bg-[#0B141A] rounded-[32px] overflow-hidden flex flex-col relative">
            
            {/* Header */}
            <div className="h-16 bg-[#008069] dark:bg-[#202C33] flex items-center px-4 shrink-0 shadow-sm z-10 relative">
              <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-600 overflow-hidden">
                 <img src="https://ui-avatars.com/api/?name=B&background=0D8BD9&color=fff" className="w-full h-full object-cover" />
              </div>
              <div className="ml-3 flex-1">
                <div className="text-white font-semibold text-[15px] flex items-center gap-1">Business Account <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-[#008069] dark:border-[#202C33]"></div></div>
                <div className="text-white/80 text-[11px]">online</div>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto relative bg-[#EFEAE2] dark:bg-[#0B141A] flex flex-col hide-scrollbar">
              <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px' }}></div>
              
              <div className="w-full max-w-[260px] bg-white dark:bg-[#202C33] rounded-xl rounded-tl-none shadow-sm relative z-10 border border-neutral-100 dark:border-transparent flex flex-col overflow-hidden">
                
                {/* Media Header Preview */}
                {headerType === 'IMAGE' && (
                  <div className="w-full h-32 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
                {headerType === 'VIDEO' && (
                  <div className="w-full h-32 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 relative">
                    <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm"><Video className="w-5 h-5 ml-0.5" /></div>
                  </div>
                )}
                {headerType === 'DOCUMENT' && (
                  <div className="w-full p-3 m-1 mt-1.5 bg-neutral-100 dark:bg-[#2A3942] rounded-lg flex items-center gap-3" style={{width: 'calc(100% - 8px)'}}>
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded flex items-center justify-center shrink-0"><FileText className="w-5 h-5"/></div>
                    <div className="flex-1 overflow-hidden">
                       <div className="h-2 w-20 bg-neutral-200 dark:bg-neutral-600 rounded mb-1.5"></div>
                       <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-600 rounded"></div>
                    </div>
                  </div>
                )}
                
                {/* Text Content */}
                <div className="p-2.5 pb-1 flex flex-col flex-1">
                  {headerType === 'TEXT' && headerText && (
                    <div className="font-bold text-neutral-900 dark:text-[#E9EDEF] text-[14.5px] mb-1.5 leading-tight">{headerText}</div>
                  )}
                  
                  {body ? (
                    <div className="text-[14px] text-neutral-900 dark:text-[#E9EDEF] whitespace-pre-wrap leading-[19px]">
                      {renderPreviewText(body)}
                    </div>
                  ) : (
                    <div className="text-[14px] text-neutral-400 italic">Body text...</div>
                  )}
                  
                  {footer && (
                    <div className="text-[11.5px] text-neutral-500 dark:text-[#8696A0] mt-1.5 leading-snug">{footer}</div>
                  )}
                  
                  <div className="text-[10px] text-neutral-400 text-right mt-1 font-medium">12:00 PM</div>
                </div>
              </div>
              
              {/* Buttons Preview */}
              {buttons.length > 0 && (
                 <div className="w-full max-w-[260px] flex flex-col gap-1 mt-1 z-10">
                   {buttons.map((btn, i) => (
                     <div key={i} className="bg-white dark:bg-[#202C33] rounded-xl shadow-sm py-2.5 px-3 flex items-center justify-center text-[#00A884] dark:text-[#53bdeb] text-[14.5px] font-[500] border border-neutral-100 dark:border-transparent cursor-default gap-2">
                       {btn.type === 'URL' && <Link className="w-4 h-4"/>}
                       {btn.type === 'PHONE_NUMBER' && <Phone className="w-4 h-4"/>}
                       {btn.text || 'Button'}
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
