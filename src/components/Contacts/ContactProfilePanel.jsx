import React, { useState } from 'react';
import { X, Share, Search as SearchIcon, MessageCircle, Bell, Palette, Lock, Users, Star, FileText, Info } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function ContactProfilePanel({ contact, messages = [], onClose, onSearchClick }) {
  const [activeTab, setActiveTab] = useState('info');
  const [isMuted, setIsMuted] = useState(false);

  if (!contact) return null;

  const mediaMessages = messages.filter(m => m.media_url);

  const tabs = [
    { id: 'info', label: 'Info', icon: Info },
    { id: 'media', label: 'Media, links and docs', icon: FileText },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'groups', label: 'Groups in common', icon: Users },
  ];

  return (
    <>
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div 
          className="bg-white dark:bg-[#202C33] rounded-xl shadow-2xl flex overflow-hidden flex-col md:flex-row w-full max-w-3xl h-[85vh] md:h-[600px] border border-neutral-200 dark:border-[#2A3942]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Sidebar */}
          <div className="w-full md:w-[280px] bg-neutral-50 dark:bg-[#111B21] border-b md:border-b-0 md:border-r border-neutral-200 dark:border-[#202C33] flex flex-col shrink-0">
            <div className="p-3 md:p-5 flex justify-between items-center">
              <h2 className="text-neutral-900 dark:text-[#E9EDEF] text-base md:text-[19px] font-semibold">Contact</h2>
              <button onClick={onClose} className="md:hidden text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-row md:flex-col px-3 gap-2 md:gap-1 overflow-x-auto md:overflow-y-auto pb-3 md:pb-0 hide-scrollbar">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-colors whitespace-nowrap md:w-full text-left",
                      isActive ? "bg-neutral-200 dark:bg-[#2A3942]" : "hover:bg-neutral-100 dark:hover:bg-[#202C33]"
                    )}
                  >
                    <Icon className={clsx("w-4 h-4 md:w-5 md:h-5 shrink-0", isActive ? "text-emerald-600 dark:text-[#00A884]" : "text-neutral-500 dark:text-[#8696A0]")} />
                    <span className={clsx("text-xs md:text-sm font-medium", isActive ? "text-neutral-900 dark:text-[#E9EDEF]" : "text-neutral-700 dark:text-[#D1D7DB]")}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-[#111B21] relative">
            {activeTab === 'info' && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-neutral-900 dark:text-[#E9EDEF] text-base font-semibold mb-8">Info</h2>
                  
                  {/* Profile Header */}
                  <div className="flex flex-col items-center">
                    <div className="w-[180px] h-[180px] rounded-full bg-emerald-700 flex items-center justify-center text-6xl font-bold text-white shadow-lg mb-6 overflow-hidden">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-neutral-900 dark:text-[#E9EDEF] text-[22px] font-semibold mb-1">{contact.name}</h1>
                    <p className="text-neutral-500 dark:text-[#8696A0] text-base mb-8">{contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`}</p>
                    
                    {/* Share / Search Buttons */}
                    <div className="flex gap-4 w-full max-w-sm mb-6">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(contact.phone);
                          toast.success('Phone number copied to clipboard');
                        }}
                        className="flex-1 flex flex-col items-center justify-center gap-2 bg-white dark:bg-[#202C33] hover:bg-neutral-100 dark:hover:bg-[#2A3942] rounded-xl py-3 px-4 shadow-sm transition-colors border border-neutral-100 dark:border-transparent"
                      >
                        <Share className="w-6 h-6 text-emerald-600 dark:text-[#00A884]" />
                        <span className="text-neutral-700 dark:text-[#D1D7DB] text-[13px]">Share</span>
                      </button>
                      <button 
                        onClick={onSearchClick}
                        className="flex-1 flex flex-col items-center justify-center gap-2 bg-white dark:bg-[#202C33] hover:bg-neutral-100 dark:hover:bg-[#2A3942] rounded-xl py-3 px-4 shadow-sm transition-colors border border-neutral-100 dark:border-transparent"
                      >
                        <SearchIcon className="w-6 h-6 text-emerald-600 dark:text-[#00A884]" />
                        <span className="text-neutral-700 dark:text-[#D1D7DB] text-[13px]">Search</span>
                      </button>
                    </div>

                    {/* About section / Contact Details */}
                    <div className="w-full bg-white dark:bg-[#202C33] rounded-xl overflow-hidden mb-4 shadow-sm border border-neutral-100 dark:border-transparent">
                      <div 
                        onClick={onClose}
                        className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#2A3942] transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-neutral-900 dark:text-[#E9EDEF] text-[15px]">{contact.name}</span>
                          <span className="text-neutral-500 dark:text-[#8696A0] text-[13px]">{contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-[#00A884]/20 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-[#00A884]" />
                        </div>
                      </div>
                    </div>

                    {/* Settings section */}
                    <div className="w-full bg-white dark:bg-[#202C33] rounded-xl overflow-hidden shadow-sm border border-neutral-100 dark:border-transparent">
                      <div 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-4 flex items-center justify-between border-b border-neutral-100 dark:border-[#111B21] hover:bg-neutral-50 dark:hover:bg-[#2A3942] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <Bell className="w-5 h-5 text-neutral-500 dark:text-[#8696A0]" />
                          <span className="text-neutral-900 dark:text-[#E9EDEF] text-[15px]">Mute</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500 dark:text-[#8696A0] text-sm">{isMuted ? 'Yes' : 'No'}</span>
                          <span className="text-neutral-400 dark:text-[#8696A0] text-xl">›</span>
                        </div>
                      </div>
                      <div 
                        onClick={() => toast('Chat themes coming soon!', { icon: '🎨' })}
                        className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#2A3942] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <Palette className="w-5 h-5 text-neutral-500 dark:text-[#8696A0]" />
                          <span className="text-neutral-900 dark:text-[#E9EDEF] text-[15px]">Chat theme</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 dark:text-[#8696A0] text-xl">›</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'media' && (
              <div className="flex-1 overflow-y-auto p-6">
                <h2 className="text-neutral-900 dark:text-[#E9EDEF] text-base font-semibold mb-6">Media, links and docs</h2>
                {mediaMessages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaMessages.map(msg => {
                      const isImage = msg.media_type === 'image' || msg.media_url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                      const isVideo = msg.media_type === 'video' || msg.media_url.match(/\.(mp4|webm|ogg)$/i);
                      return (
                        <div key={msg.id} className="aspect-square bg-neutral-200 dark:bg-[#202C33] rounded-lg overflow-hidden cursor-pointer relative group">
                          {isImage ? (
                            <img src={`http://localhost:3001${msg.media_url}`} alt="Media" className="w-full h-full object-cover group-hover:brightness-90 transition-all" />
                          ) : isVideo ? (
                            <div className="w-full h-full relative">
                              <video src={`http://localhost:3001${msg.media_url}`} className="w-full h-full object-cover group-hover:brightness-90 transition-all" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                  <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-1"></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <a href={`http://localhost:3001${msg.media_url}`} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-neutral-100 dark:bg-[#2A3942] hover:bg-neutral-200 dark:hover:bg-[#32454f] transition-colors">
                              <FileText className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mb-2" />
                              <span className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate w-full px-1">{msg.media_url.split('/').pop()}</span>
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center mt-10">
                    <div className="w-24 h-24 bg-white dark:bg-[#202C33] shadow-sm dark:shadow-none border border-neutral-100 dark:border-transparent rounded-full mb-6 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-neutral-400 dark:text-[#8696A0]" />
                    </div>
                    <h3 className="text-neutral-900 dark:text-[#E9EDEF] text-lg font-medium mb-2">No Media, links and docs</h3>
                    <p className="text-neutral-500 dark:text-[#8696A0] text-sm max-w-sm">This section is currently empty for {contact.name}.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab !== 'info' && activeTab !== 'media' && (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white dark:bg-[#202C33] shadow-sm dark:shadow-none border border-neutral-100 dark:border-transparent rounded-full mb-6 flex items-center justify-center">
                  {activeTab === 'starred' && <Star className="w-10 h-10 text-neutral-400 dark:text-[#8696A0]" />}
                  {activeTab === 'security' && <Lock className="w-10 h-10 text-neutral-400 dark:text-[#8696A0]" />}
                  {activeTab === 'groups' && <Users className="w-10 h-10 text-neutral-400 dark:text-[#8696A0]" />}
                </div>
                <h3 className="text-neutral-900 dark:text-[#E9EDEF] text-lg font-medium mb-2">No {tabs.find(t => t.id === activeTab)?.label}</h3>
                <p className="text-neutral-500 dark:text-[#8696A0] text-sm max-w-sm">This section is currently empty for {contact.name}.</p>
              </div>
            )}

            {/* Bottom Done Button (Desktop only) */}
            <div className="absolute bottom-4 right-4 hidden md:block">
              <button 
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00A884] dark:hover:bg-[#029071] text-white px-6 py-2 rounded-full font-medium transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
