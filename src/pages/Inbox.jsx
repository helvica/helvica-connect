import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MoreVertical, Paperclip, Send, Smile, Phone, Video, Info, FileText, Image as ImageIcon, Check, CheckCheck, Loader2, Bot, BotMessageSquare, Sparkles, Wand2, RefreshCcw, Tag, Copy, X, Store, Edit, ChevronLeft, User, MessageCircle, ShoppingBag, Users, Plus, Mic, Reply, Star, Pin, Forward, ChevronDown, Play, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import ContactProfilePanel from '../components/Contacts/ContactProfilePanel';

const WhatsAppAudioPlayer = ({ src, sender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setProgress((current / total) * 100);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center gap-3 min-w-[260px] max-w-[300px] p-1.5">
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        className="hidden" 
      />
      
      {/* Avatar with Mic */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center overflow-hidden">
          <User className="w-6 h-6 text-neutral-400 dark:text-[#8696A0]" />
        </div>
        <div className={clsx("absolute -bottom-0.5 -right-0.5 rounded-full p-[3px] border-[2px]", sender === 'agent' ? "bg-[#53bdeb] border-[#D9FDD3] dark:border-[#005C4B]" : "bg-[#00A884] border-white dark:border-[#202C33]")}>
          <Mic className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* Play/Pause Button */}
      <button onClick={togglePlay} className={clsx("shrink-0", sender === 'agent' ? "text-neutral-500 dark:text-[#E9EDEF]" : "text-neutral-500 dark:text-[#8696A0]")}>
        {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current pl-1" />}
      </button>

      {/* Waveform and Time */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative w-full h-6 flex items-center gap-[2px]">
          {/* Fake waveform bars */}
          {[...Array(28)].map((_, i) => (
            <div 
              key={i} 
              className={clsx(
                "w-1 rounded-full transition-colors duration-150", 
                (i / 28) * 100 < progress ? (sender === 'agent' ? 'bg-[#53bdeb] dark:bg-[#53bdeb]' : 'bg-[#00A884]') : (sender === 'agent' ? 'bg-neutral-400/50 dark:bg-neutral-400/50' : 'bg-neutral-300 dark:bg-neutral-600')
              )} 
              style={{ height: `${Math.max(20, Math.abs(Math.sin(i * 0.5)) * 100)}%` }}
            ></div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className={clsx("text-[11px]", sender === 'agent' ? "text-neutral-500 dark:text-[#8696A0]" : "text-neutral-500 dark:text-[#8696A0]")}>
            {formatTime(isPlaying ? audioRef.current?.currentTime : duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Inbox() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef(null);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState('All');
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [typingAgents, setTypingAgents] = useState({}); // { chatId: agentName }
  const [socket, setSocket] = useState(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null); // id of message with open menu
  const CURRENT_AGENT_NAME = "Vishal Gupta"; // Hardcoded for demo, normally from AuthContext
  
  // Slash Commands / Quick Replies
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplyFilter, setQuickReplyFilter] = useState('');
  const [activeReplyIndex, setActiveReplyIndex] = useState(0);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  const QUICK_REPLIES = [
    { command: '/hello', text: 'Hello! 👋 Thanks for getting in touch with Helvica. How can we assist you today?' },
    { command: '/pricing', text: 'Our pricing varies depending on the specific product. You can check out our full catalog using the Shopping Bag icon, or let me know which item you are interested in!' },
    { command: '/support', text: 'I am so sorry you are experiencing an issue. Could you please provide your order number or a bit more detail so I can look into this immediately?' },
    { command: '/goodbye', text: 'You are very welcome! Let me know if there is anything else you need. Have a great day!' },
    { command: '/wait', text: 'Thank you for the message! I am reviewing this now and will get back to you in just a moment.' },
  ];

  // Fetch Chats
  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/chats`);
      return res.data;
    }
  });

  // Fetch Contacts to link to Chat Profiles
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/contacts`);
      return res.data;
    }
  });

  // Fetch Products for Catalog Modal
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/products`);
      return res.data;
    }
  });

  // Socket.io real-time listener
  useEffect(() => {
    const baseUrl = API_URL.replace('/api', '');
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    newSocket.on('chatsUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    newSocket.on('newMessage', (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    newSocket.on('messageReacted', (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
    });

    // Listen for typing events
    newSocket.on('agentTyping', ({ chatId, agentName }) => {
      setTypingAgents(prev => ({ ...prev, [chatId]: agentName }));
    });
    
    newSocket.on('agentStoppedTyping', ({ chatId }) => {
      setTypingAgents(prev => {
        const next = { ...prev };
        delete next[chatId];
        return next;
      });
    });

    return () => newSocket.disconnect();
  }, [API_URL, queryClient]);

  const scrollContainerRef = useRef(null);

  // Function to mark chat as read
  const markAsRead = useCallback(() => {
    if (selectedChat && selectedChat.unreadCount > 0) {
      queryClient.setQueryData(['chats'], (oldChats) => {
        if (!oldChats) return oldChats;
        return oldChats.map(c => c.id === selectedChat.id ? { ...c, unreadCount: 0 } : c);
      });
      setSelectedChat(prev => ({ ...prev, unreadCount: 0 }));
      axios.put(`${API_URL}/chats/${selectedChat.id}/read`).catch(console.error);
    }
  }, [selectedChat, queryClient, API_URL]);

  const isNearBottomRef = useRef(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    const isNear = scrollHeight - scrollTop - clientHeight < 100;
    isNearBottomRef.current = isNear;

    // If scrolled within 100px of the bottom, clear the unread badge
    if (isNear) {
      markAsRead();
    }
  };

  // Fetch Messages for selected chat
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedChat?.id],
    queryFn: async () => {
      if (!selectedChat) return [];
      const res = await axios.get(`${API_URL}/chats/${selectedChat.id}/messages`);
      return res.data;
    },
    enabled: !!selectedChat
  });

  // When changing chats, ALWAYS scroll to bottom instantly
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Small timeout ensures DOM has rendered messages before scrolling
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          isNearBottomRef.current = true;
          handleScroll();
        }
      }, 50);
    }
  }, [selectedChat?.id]);

  // Scroll to bottom if already near bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current && isNearBottomRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      handleScroll();
    }
  }, [messages]);  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessageData) => {
      let payload;
      let headers = {};
      
      if (newMessageData.file) {
        payload = new FormData();
        payload.append('text', newMessageData.text);
        payload.append('sender', newMessageData.sender);
        payload.append('media', newMessageData.file);
        if (newMessageData.replyTo) payload.append('replyTo', newMessageData.replyTo);
        // Do NOT manually set Content-Type header when using FormData with Axios, 
        // it automatically sets it with the correct boundary string.
      } else {
        payload = { 
          text: newMessageData.text, 
          sender: newMessageData.sender,
          ...(newMessageData.replyTo && { replyTo: newMessageData.replyTo })
        };
      }
      
      const res = await axios.post(`${API_URL}/chats/${selectedChat.id}/messages`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setReplyingToMessage(null);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
    }
  });

  const handleDeleteMessage = (messageId) => {
    // Optimistically update the UI to remove the message
    queryClient.setQueryData(['messages', selectedChat.id], old => old.filter(m => m.id !== messageId));
    setActiveMessageMenu(null);
  };

  const handleReplyMessage = (msg) => {
    setReplyingToMessage(msg);
    setActiveMessageMenu(null);
  };

  const handleReactMessage = async (messageId, emoji) => {
    // Optimistic update
    queryClient.setQueryData(['messages', selectedChat.id], old => 
      old.map(m => m.id === messageId ? { ...m, reaction: emoji } : m)
    );
    setActiveMessageMenu(null);
    
    try {
      await axios.put(`${API_URL}/chats/${selectedChat.id}/messages/${messageId}/react`, { emoji });
    } catch (err) {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChat.id] });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMessageMenu && !event.target.closest('.message-dropdown')) {
        setActiveMessageMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMessageMenu]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || !selectedChat) return;

    // Emit stop typing since message is sent
    if (socket) socket.emit('stopTyping', { chatId: selectedChat.id });

    sendMessageMutation.mutate({
      text: inputValue,
      sender: 'agent',
      file: selectedFile,
      replyTo: replyingToMessage?.id || null
    });
    setShowQuickReplies(false);
    setInputValue('');
    setSelectedFile(null);
  };
  
  // Handle typing to broadcast to other agents & detect slash commands
  let typingTimeout = useRef(null);
  const handleTyping = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Slash Command Logic
    if (val === '/') {
      setShowQuickReplies(true);
      setQuickReplyFilter('');
      setActiveReplyIndex(0);
    } else if (val.startsWith('/')) {
      setShowQuickReplies(true);
      setQuickReplyFilter(val.substring(1).toLowerCase());
      setActiveReplyIndex(0);
    } else {
      setShowQuickReplies(false);
    }
    
    if (socket && selectedChat) {
      socket.emit('typing', { chatId: selectedChat.id, agentName: CURRENT_AGENT_NAME });
      
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stopTyping', { chatId: selectedChat.id });
      }, 2000);
    }
  };

  const filteredQuickReplies = QUICK_REPLIES.filter(qr => 
    qr.command.toLowerCase().includes(quickReplyFilter) || 
    qr.text.toLowerCase().includes(quickReplyFilter)
  );

  const handleKeyDown = (e) => {
    if (showQuickReplies && filteredQuickReplies.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveReplyIndex(prev => (prev + 1) % filteredQuickReplies.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveReplyIndex(prev => (prev - 1 + filteredQuickReplies.length) % filteredQuickReplies.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertQuickReply(filteredQuickReplies[activeReplyIndex]);
      } else if (e.key === 'Escape') {
        setShowQuickReplies(false);
      }
    }
  };

  const insertQuickReply = (reply) => {
    setInputValue(reply.text);
    setShowQuickReplies(false);
  };

  // AI Copilot Draft
  const handleCopilotDraft = async (intent = '') => {
    if (!selectedChat) return;
    setIsDrafting(true);
    try {
      const res = await axios.post(`${API_URL}/chats/${selectedChat.id}/smart-reply`, { intent });
      if (res.data && res.data.reply) {
        setInputValue(res.data.reply);
      }
    } catch (err) {
      console.error("Failed to generate draft:", err);
    } finally {
      setIsDrafting(false);
    }
  };

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ chatId, status }) => {
      const res = await axios.put(`${API_URL}/chats/${chatId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const handleStatusChange = (e) => {
    if (!selectedChat) return;
    const newStatus = e.target.value;
    updateStatusMutation.mutate({ chatId: selectedChat.id, status: newStatus });
    setSelectedChat({ ...selectedChat, status: newStatus });
  };

  const handleSendProduct = (product) => {
    if (!selectedChat) return;
    const text = `*${product.name}*\nPrice: $${product.price}\n\n${product.description}\n\n_Tap the link below or reply to order_`;
    sendMessageMutation.mutate({ text: text, sender: 'agent' });
    setShowCatalogModal(false);
  };

  const filteredChats = chats.filter(chat => {
    const matchFilter = filter === 'All' || chat.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = chat.contactName?.toLowerCase().includes(searchLower) || 
                        chat.contactPhone?.includes(searchLower) ||
                        chat.lastMessage?.toLowerCase().includes(searchLower);
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-[#111B21] relative">
      <div className={clsx("w-full md:w-80 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111B21]", selectedChat ? "hidden md:flex md:flex-col" : "flex flex-col")}>
        
        {/* WhatsApp Sidebar Header */}
        <div className="h-16 px-4 flex justify-between items-center bg-neutral-50 dark:bg-[#202C33] shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Chats</h1>
          <div className="flex gap-3 text-neutral-500 dark:text-[#AEBAC1]">
            <button className="hover:bg-neutral-200 dark:hover:bg-[#2A3942] p-2 rounded-full transition-colors"><Edit className="w-5 h-5" /></button>
            <button className="hover:bg-neutral-200 dark:hover:bg-[#2A3942] p-2 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="px-3 pt-3 pb-2 bg-white dark:bg-[#111B21]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-[#8696A0]" />
            <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-100 dark:bg-[#202C33] text-neutral-900 dark:text-neutral-100 rounded-lg pl-10 pr-4 py-1.5 text-sm outline-none placeholder-neutral-500 dark:placeholder-[#8696A0]" />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Open', 'Pending', 'Solved'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={clsx("px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors", filter === f ? "bg-emerald-100 text-emerald-800 dark:bg-[#0A332C] dark:text-[#00A884]" : "bg-neutral-100 text-neutral-600 dark:bg-[#202C33] dark:text-[#8696A0] hover:bg-neutral-200 dark:hover:bg-[#2A3942]")}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111B21]">
          {filteredChats.map(chat => (
            <div key={chat.id} onClick={() => setSelectedChat(chat)} className={clsx("flex items-center px-3 py-3 cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-[#202C33]", selectedChat?.id === chat.id ? "bg-neutral-100 dark:bg-[#2A3942]" : "")}>
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-medium mr-3">
                {chat.contactName?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0 border-b border-neutral-100 dark:border-[#202C33] pb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-medium text-[17px] text-neutral-900 dark:text-[#E9EDEF] truncate">{chat.contactName || chat.contactPhone}</span>
                  <span className={clsx("text-xs flex-shrink-0 ml-2", chat.unreadCount > 0 ? "text-[#00A884]" : "text-neutral-500 dark:text-[#8696A0]")}>
                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-neutral-500 dark:text-[#8696A0] truncate pr-2 flex-1">
                    {msg => msg.sender === 'agent' ? <CheckCheck className="inline w-3.5 h-3.5 mr-1 text-neutral-400 dark:text-[#8696A0]" /> : null}
                    {chat.lastMessage}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-emerald-500 dark:bg-[#00A884] text-white dark:text-[#111B21] text-xs font-semibold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full flex-shrink-0">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
      <div className={clsx("flex-1 flex-col min-w-0 bg-[#EFEAE2] dark:bg-[#111B21]", selectedChat ? "flex" : "hidden md:flex")}>
        {selectedChat ? (
          <>
            {/* WhatsApp Main Chat Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-neutral-50 dark:bg-[#202C33] shrink-0 border-b border-neutral-200 dark:border-neutral-800 z-10">
              {isChatSearchOpen ? (
                <div className="flex-1 flex items-center bg-white dark:bg-[#2A3942] rounded-lg px-3 py-1.5 border border-neutral-200 dark:border-neutral-700/50 mr-4">
                  <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search messages..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-200"
                  />
                  <button onClick={() => { setIsChatSearchOpen(false); setChatSearchQuery(''); }} className="ml-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedChat(null)} 
                    className="md:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-700 dark:text-[#AEBAC1] dark:hover:text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-neutral-200 dark:hover:bg-[#2A3942] p-1 rounded-md transition-colors"
                    onClick={() => setShowProfilePanel(!showProfilePanel)}
                  >
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold dark:bg-indigo-900/50 dark:text-indigo-400">
                    {selectedChat.contactName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">{selectedChat.contactName || selectedChat.contactPhone}</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{selectedChat.contactPhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={selectedChat.status || 'Open'}
                  onChange={handleStatusChange}
                  className="bg-neutral-100 dark:bg-[#2A3942] text-sm text-neutral-700 dark:text-[#D1D7DB] rounded-md px-2 py-1 outline-none cursor-pointer border border-transparent focus:border-emerald-500 transition-colors mr-2"
                >
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Solved">Solved</option>
                </select>
                <button onClick={() => setIsChatSearchOpen(!isChatSearchOpen)} className="p-2 text-neutral-500 dark:text-[#AEBAC1] hover:bg-neutral-200 dark:hover:bg-[#2A3942] rounded-full transition-colors"><Search className="h-5 w-5" /></button>
              </div>
            </div>
            
            {/* WhatsApp Background & Messages */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-4 relative whatsapp-bg"
            >
              {messages.length > 0 && !chatSearchQuery.trim() && (
                <div className="flex justify-center mb-6 relative z-10">
                  <span className="bg-white dark:bg-[#182229] text-neutral-600 dark:text-neutral-300 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                    Today
                  </span>
                </div>
              )}
              {(chatSearchQuery.trim() 
                  ? messages.filter(m => m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                  : messages
              ).map((msg, index, arr) => (
                <div key={msg.id} id={`message-${msg.id}`} className={clsx("flex w-full py-0.5 transition-colors duration-700 relative group", activeMessageMenu === msg.id ? "z-50" : "z-10", msg.sender === 'agent' ? "justify-end" : "justify-start")}>
                  <div className={clsx(
                    "max-w-[65%] rounded-lg px-2 shadow-sm text-[14.2px] leading-relaxed relative flex flex-col", 
                    msg.sender === 'agent' 
                      ? "bg-[#D9FDD3] text-[#111B21] dark:bg-[#005C4B] dark:text-[#E9EDEF] rounded-tr-none after:content-[''] after:absolute after:top-0 after:-right-2 after:w-0 after:h-0 after:border-[10px] after:border-transparent after:border-t-[#D9FDD3] dark:after:border-t-[#005C4B] after:border-l-0 after:border-b-0 after:mt-0" 
                      : "bg-white text-[#111B21] dark:bg-[#202C33] dark:text-[#E9EDEF] rounded-tl-none after:content-[''] after:absolute after:top-0 after:-left-2 after:w-0 after:h-0 after:border-[10px] after:border-transparent after:border-t-white dark:after:border-t-[#202C33] after:border-r-0 after:border-b-0 after:mt-0"
                  )}>
                    {msg.replyTo && (() => {
                      const repliedMsg = messages.find(m => m.id === msg.replyTo);
                      return (
                        <div 
                          onClick={() => {
                            const el = document.getElementById(`message-${msg.replyTo}`);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              el.classList.add('bg-black/10', 'dark:bg-white/10');
                              setTimeout(() => {
                                el.classList.remove('bg-black/10', 'dark:bg-white/10');
                              }, 1200);
                            }
                          }}
                          className="bg-black/5 dark:bg-black/20 px-2.5 py-1.5 rounded-[5px] mt-1.5 mx-0.5 border-l-[3px] border-orange-500 mb-1 cursor-pointer hover:bg-black/10 dark:hover:bg-black/30 transition-colors"
                        >
                           <p className="text-[13px] font-semibold text-orange-600 dark:text-orange-500 leading-snug">{repliedMsg?.sender === 'agent' ? 'You' : (selectedChat.contactName || selectedChat.contactPhone)}</p>
                           <p className="text-[13px] text-neutral-600 dark:text-neutral-300 truncate opacity-90 leading-snug">
                             {repliedMsg 
                               ? (repliedMsg.text || (repliedMsg.media_type ? `📷 ${repliedMsg.media_type.charAt(0).toUpperCase() + repliedMsg.media_type.slice(1)}` : ''))
                               : 'Original message not found'}
                           </p>
                        </div>
                      );
                    })()}
                    <div className="flex flex-col pt-1.5 pb-2 min-w-[80px]">
                      {msg.media_url && (
                        <div className="mb-1 rounded-lg overflow-hidden max-w-[280px]">
                          {msg.media_type === 'image' || msg.media_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <img src={`${API_URL.replace('/api', '')}${msg.media_url}`} alt="Media" className="w-full h-auto object-cover rounded-md" />
                          ) : msg.media_type === 'video' || msg.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={`${API_URL.replace('/api', '')}${msg.media_url}`} controls className="w-full h-auto rounded-md max-h-[300px]" />
                          ) : msg.media_type === 'audio' || msg.media_type === 'voice' || msg.media_url.match(/\.(mp3|wav|aac|oga|ogg|m4a)$/i) ? (
                            <WhatsAppAudioPlayer src={`${API_URL.replace('/api', '')}${msg.media_url}`} sender={msg.sender} />
                          ) : (
                            <a href={`${API_URL.replace('/api', '')}${msg.media_url}`} target="_blank" rel="noreferrer" className={clsx("flex flex-col w-[260px] rounded-lg overflow-hidden border transition-all", msg.sender === 'agent' ? "bg-white/40 dark:bg-[#126857] border-transparent hover:brightness-95" : "bg-neutral-50 dark:bg-[#1D282F] border-neutral-200 dark:border-neutral-700/50 hover:brightness-95")}>
                              <div className="h-28 bg-white dark:bg-white flex items-center justify-center p-3">
                                <div className="w-full h-full border border-neutral-200 bg-neutral-50 rounded shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative overflow-hidden">
                                  <div className="absolute top-3 left-3 right-3 h-2.5 bg-neutral-200 rounded-full"></div>
                                  <div className="absolute top-8 left-3 w-2/3 h-2 bg-neutral-200 rounded-full"></div>
                                  <div className="absolute top-12 left-3 w-1/2 h-2 bg-neutral-200 rounded-full"></div>
                                </div>
                              </div>
                              <div className={clsx("p-3 flex items-center gap-3", msg.sender === 'agent' ? "bg-[#c6f3c1] dark:bg-[#126857]" : "bg-neutral-50 dark:bg-[#1D282F]")}>
                                <div className="bg-[#E53935] rounded p-1.5 flex-shrink-0">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={clsx("text-[13px] font-medium truncate", msg.sender === 'agent' ? "text-neutral-900 dark:text-[#E9EDEF]" : "text-neutral-900 dark:text-[#E9EDEF]")}>{msg.media_url.split('/').pop()}</p>
                                  <p className={clsx("text-[11px] mt-0.5", msg.sender === 'agent' ? "text-neutral-600 dark:text-[#8696A0]" : "text-neutral-500 dark:text-[#8696A0]")}>1 page • PDF</p>
                                </div>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.text && (
                        <span className="pr-16 inline-block break-words">{msg.text}</span>
                      )}
                      <div className="absolute bottom-1 right-2 flex items-center gap-1">
                        <span className="text-[11px] text-neutral-500 dark:text-white/60 leading-none">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.sender === 'agent' && <CheckCheck className="h-[15px] w-[15px] text-[#53bdeb] leading-none" />}
                      </div>
                    </div>
                    {msg.reaction && (
                      <div className={clsx(
                        "absolute -bottom-3 bg-white dark:bg-[#202C33] border border-neutral-100 dark:border-neutral-700 rounded-full px-1.5 py-0.5 text-sm shadow-sm z-20",
                        msg.sender === 'agent' ? "right-2" : "left-2"
                      )}>
                        {msg.reaction}
                      </div>
                    )}

                    {/* Hover Dropdown Menu */}
                    <div className="message-dropdown">
                      <button 
                        onClick={() => setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id)}
                        className={clsx(
                          "absolute top-0 right-0 p-0.5 m-0.5 rounded-full transition-opacity opacity-0 group-hover:opacity-100 z-10",
                          msg.sender === 'agent' ? "text-neutral-500 dark:text-neutral-300 hover:bg-[#D9FDD3] dark:hover:bg-[#005C4B]" : "text-neutral-500 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#202C33]"
                        )}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                      {activeMessageMenu === msg.id && (
                        <div className={clsx(
                          "absolute w-48 bg-white dark:bg-[#233138]/95 backdrop-blur-sm rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-xl border border-neutral-100 dark:border-[#2A3942] py-2 z-50 text-neutral-700 dark:text-[#D1D7DB]",
                          index >= arr.length - 2 ? "bottom-8 mb-1" : "top-8",
                          msg.sender === 'agent' ? "right-0" : "left-0"
                        )}>
                          <button onClick={() => handleReplyMessage(msg)} className="w-full flex items-center px-5 py-2.5 text-[14.5px] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"><Reply className="w-4 h-4 mr-3 text-neutral-500 dark:text-neutral-400" /> <span className="flex-1 text-left">Reply</span></button>
                          <button onClick={() => handleReactMessage(msg.id, '👍')} className="w-full flex items-center px-5 py-2.5 text-[14.5px] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"><Smile className="w-4 h-4 mr-3 text-neutral-500 dark:text-neutral-400" /> <span className="flex-1 text-left">React</span></button>
                          <button onClick={() => { navigator.clipboard.writeText(msg.text); setActiveMessageMenu(null); toast.success('Copied to clipboard'); }} className="w-full flex items-center px-5 py-2.5 text-[14.5px] hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"><Copy className="w-4 h-4 mr-3 text-neutral-500 dark:text-neutral-400" /> <span className="flex-1 text-left">Copy</span></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="w-full flex items-center px-5 py-2.5 text-[14.5px] text-red-600 dark:text-red-400 hover:bg-[#f5f6f6] dark:hover:bg-[#182229] transition-colors"><Trash2 className="w-4 h-4 mr-3 text-red-500 dark:text-red-400" /> <span className="flex-1 text-left">Delete</span></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {typingAgents[selectedChat.id] && (
                <div className="text-xs text-neutral-500 italic px-2">{typingAgents[selectedChat.id]} is typing...</div>
              )}
            </div>
            {/* WhatsApp Input Area */}
            <div className="px-4 py-3 bg-neutral-50 dark:bg-[#202C33] shrink-0 relative flex items-end gap-3">
              {/* Quick Replies Popup (moved logic to not clutter UI visually, but keeping it functional) */}
              {showQuickReplies && (
                <div className="absolute bottom-full left-4 mb-2 w-80 max-w-full bg-white dark:bg-[#202C33] rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50">
                  <div className="px-3 py-2 bg-neutral-50 dark:bg-[#202C33] border-b border-neutral-100 dark:border-neutral-700 text-xs font-semibold text-[#8696A0]">
                    Quick Replies
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredQuickReplies.length > 0 ? (
                      filteredQuickReplies.map((qr, index) => (
                        <div 
                          key={qr.command}
                          onClick={() => insertQuickReply(qr)}
                          className={clsx(
                            "px-4 py-3 cursor-pointer transition-colors border-b border-neutral-50 dark:border-[#111B21] last:border-0",
                            index === activeReplyIndex 
                              ? "bg-neutral-100 dark:bg-[#2A3942]" 
                              : "hover:bg-neutral-50 dark:hover:bg-[#2A3942]"
                          )}
                        >
                          <div className={clsx("font-mono text-xs font-bold mb-1", index === activeReplyIndex ? "text-[#00A884]" : "text-neutral-700 dark:text-[#E9EDEF]")}>{qr.command}</div>
                          <div className="text-sm text-neutral-500 dark:text-[#8696A0] line-clamp-2">{qr.text}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-neutral-500">No quick replies found.</div>
                    )}
                  </div>
                </div>
              )}
              
              <button type="button" onClick={() => setShowCatalogModal(true)} className="p-2 text-neutral-500 dark:text-[#8696A0] hover:bg-neutral-200 dark:hover:bg-[#2A3942] rounded-full transition-colors shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-neutral-500 dark:text-[#8696A0] hover:bg-neutral-200 dark:hover:bg-[#2A3942] rounded-full transition-colors shrink-0">
                <Plus className="w-6 h-6" />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              
              
              <div className="flex-1 bg-white dark:bg-[#2A3942] rounded-xl shadow-sm overflow-hidden border border-transparent dark:border-neutral-700/50 relative">
                {replyingToMessage && (
                  <div className="bg-neutral-100 dark:bg-black/20 p-2 border-l-4 border-emerald-500 flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{replyingToMessage.sender === 'agent' ? 'You' : (selectedChat.contactName || selectedChat.contactPhone)}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                        {replyingToMessage.text || (replyingToMessage.media_type ? `📷 ${replyingToMessage.media_type.charAt(0).toUpperCase() + replyingToMessage.media_type.slice(1)}` : '')}
                      </p>
                    </div>
                    <button onClick={() => setReplyingToMessage(null)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
                  </div>
                )}
                {selectedFile && (
                  <div className="bg-neutral-100 dark:bg-[#1D282F] p-3 border-b border-neutral-200 dark:border-neutral-700/50 flex justify-between items-center">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded shrink-0">
                        <Paperclip className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-[#E9EDEF] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-[#8696A0]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-2 bg-neutral-200 dark:bg-neutral-700/50 rounded-full text-neutral-500 hover:text-red-500 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* AI Quick Actions */}
                <div className="px-3 pt-2 pb-1 flex gap-2 overflow-x-auto no-scrollbar border-b border-neutral-100 dark:border-neutral-800">
                  <button 
                    onClick={() => handleCopilotDraft('greeting')}
                    disabled={isDrafting}
                    className="flex items-center text-xs font-medium px-2.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors whitespace-nowrap"
                  >
                    <Wand2 className="w-3 h-3 mr-1.5" /> Suggest Greeting
                  </button>
                  <button 
                    onClick={() => handleCopilotDraft('solution')}
                    disabled={isDrafting}
                    className="flex items-center text-xs font-medium px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
                  >
                    <Wand2 className="w-3 h-3 mr-1.5" /> Suggest Solution
                  </button>
                  <button 
                    onClick={() => handleCopilotDraft('apology')}
                    disabled={isDrafting}
                    className="flex items-center text-xs font-medium px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors whitespace-nowrap"
                  >
                    <Wand2 className="w-3 h-3 mr-1.5" /> Suggest Apology
                  </button>
                </div>

                <div className="flex items-center min-h-[44px] px-2">
                  <button type="button" className="p-2 text-neutral-500 dark:text-[#8696A0] hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors shrink-0">
                    <Smile className="w-6 h-6" />
                  </button>
                  <form onSubmit={handleSendMessage} className="flex-1 flex items-center h-full">
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={inputValue}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent px-2 py-2 text-[15px] text-neutral-900 dark:text-[#E9EDEF] outline-none placeholder-neutral-500 dark:placeholder-[#8696A0]"
                    disabled={sendMessageMutation.isPending}
                  />
                  <button 
                    type="button" 
                    onClick={handleCopilotDraft}
                    disabled={isDrafting}
                    className="p-2 mr-1 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 transition-colors shrink-0"
                    title="AI Auto-Draft Reply"
                  >
                    {isDrafting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  </button>
                  {inputValue.trim() || selectedFile ? (
                    <button type="submit" disabled={sendMessageMutation.isPending} className="p-2 text-neutral-500 dark:text-[#8696A0] hover:text-[#00A884] dark:hover:text-[#00A884] transition-colors shrink-0">
                      <Send className="h-5 w-5" />
                    </button>
                  ) : (
                    <button type="button" className="p-2 text-neutral-500 dark:text-[#8696A0] hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors shrink-0">
                      <Mic className="w-6 h-6" />
                    </button>
                  )}
                </form>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-black">
            <div className="h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4 border-4 border-white dark:border-neutral-800 shadow-sm">
              <MessageCircle className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Helvica Connect Web</h3>
            <p className="mt-2 text-sm max-w-sm text-center">Select a chat from the sidebar to view the conversation or start a new message.</p>
          </div>
        )}
      </div>

      {/* Slide-out Contact Profile Panel */}
      {showProfilePanel && selectedChat && (
        <ContactProfilePanel 
          contact={contacts.find(c => c.phone === selectedChat.contactPhone) || { name: selectedChat.contactName, phone: selectedChat.contactPhone }} 
          messages={messages}
          onClose={() => setShowProfilePanel(false)} 
          onSearchClick={() => {
            setShowProfilePanel(false);
            setIsChatSearchOpen(true);
          }}
        />
      )}

      {/* Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setShowCatalogModal(false)}></div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                Select Product to Send
              </h2>
              <button onClick={() => setShowCatalogModal(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-neutral-50 dark:bg-black">
              {products.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">No products in catalog. Add some from the Catalog tab.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div 
                      key={product.id} 
                      onClick={() => handleSendProduct(product)}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group flex flex-col"
                    >
                      <div className="h-32 bg-neutral-100 dark:bg-neutral-800 shrink-0">
                         {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1 truncate">{product.name}</h3>
                        <span className="text-indigo-600 font-bold text-sm">${product.price}</span>
                        <button className="mt-auto pt-2 w-full text-center text-xs font-semibold text-neutral-600 group-hover:text-indigo-600">
                          Click to Send →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
