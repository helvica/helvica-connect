import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Search, Filter, Plus, ChevronDown, PlayCircle, Download, MoreHorizontal, User, Smartphone, Calendar, Tag, HardDrive, Edit2, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import ContactProfilePanel from '../components/Contacts/ContactProfilePanel';
import { exportToCsv } from '../utils/exportToCsv';

export default function Contacts() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [tags, setTags] = useState(''); // Comma separated for simplicity
  const [source, setSource] = useState('Manual');

  // Fetch Contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/contacts`);
      return res.data;
    }
  });

  // Create Contact
  const createMutation = useMutation({
    mutationFn: async (newContact) => {
      const res = await axios.post(`${API_URL}/contacts`, newContact);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact added successfully');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to add contact');
    }
  });

  // Update Contact
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axios.put(`${API_URL}/contacts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact updated successfully');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update contact');
    }
  });

  // Delete Contact
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${API_URL}/contacts/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact deleted successfully');
      setSelectedIds([]); // Clear selection if any
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete contact');
    }
  });

  // Bulk Delete Contacts
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      // In a real app, we'd have a specific bulk delete endpoint
      // For now, we'll sequentially delete them
      for (const id of ids) {
         await axios.delete(`${API_URL}/contacts/${id}`);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Selected contacts deleted');
      setSelectedIds([]);
    }
  });

  const openModal = (contact = null) => {
    if (contact) {
      setEditingId(contact.id);
      setName(contact.name);
      setPhone(contact.phone);
      setDob(contact.dob || '');
      
      let parsedTags = [];
      if (Array.isArray(contact.tags)) {
        parsedTags = contact.tags;
      } else if (typeof contact.tags === 'string') {
        try { 
          parsedTags = JSON.parse(contact.tags); 
          if (!Array.isArray(parsedTags)) parsedTags = [contact.tags];
        } catch (e) { 
          parsedTags = [contact.tags]; 
        }
      }
      setTags(parsedTags.join(', '));
      
      setSource(contact.source);
    } else {
      setEditingId(null);
      setName('');
      setPhone('');
      setDob('');
      setTags('');
      setSource('Manual');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = (e) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name, phone, dob, tags: tagArray, source } });
    } else {
      createMutation.mutate({ name, phone, dob, tags: tagArray, source });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contact.phone.includes(searchQuery)
  );

  const handleExportCsv = () => {
    // Only include relevant fields
    const exportData = contacts.map(c => ({
      ID: c.id,
      Name: c.name,
      Phone: c.phone,
      DOB: c.dob || '',
      Tags: Array.isArray(c.tags) ? c.tags.join(', ') : c.tags || '',
      Source: c.source
    }));
    exportToCsv('helvica_contacts_export.csv', exportData);
  };

  return (
    <div className="p-8 h-full flex flex-col bg-neutral-50 dark:bg-black">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          Contacts
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3 w-1/2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search name or mobile number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 border-none rounded-lg text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg cursor-not-allowed">
            BROADCAST
          </button>
          {selectedIds.length > 0 && (
             <button 
                onClick={() => bulkDeleteMutation.mutate(selectedIds)} 
                disabled={bulkDeleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-sm"
             >
                <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
             </button>
          )}
          <button className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm">
            Run Ad
          </button>
          <button onClick={() => openModal(null)} className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
          <button onClick={handleExportCsv} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5 shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5 shadow-sm">
            Import <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5 shadow-sm">
            Actions <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-hidden card bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col rounded-xl shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10 bg-white dark:bg-neutral-900">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={filteredContacts.length > 0 && selectedIds.length === filteredContacts.length}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500" 
                  />
                </th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Mobile Number</th>
                <th className="px-6 py-4 font-medium">DOB</th>
                <th className="px-6 py-4 font-medium">Date Added</th>
                <th className="px-6 py-4 font-medium">Tags</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-12 text-neutral-500">Loading contacts...</td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-24 text-neutral-500">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen className="w-12 h-12 text-neutral-200 dark:text-neutral-800 mb-4" />
                      <p className="text-base font-medium text-neutral-900 dark:text-white mb-1">No Contacts Yet</p>
                      <p className="text-sm">Import contacts or add them manually to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => setSelectedContact(contact)}
                    className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500" 
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">{contact.name}</td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{contact.phone}</td>
                    <td className="px-6 py-4 text-neutral-500">{contact.dob || '-'}</td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {new Date(contact.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
                      <span className="text-[10px] text-neutral-400">{new Date(contact.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags && Array.isArray(contact.tags) && contact.tags.length > 0 ? (
                          contact.tags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md border",
                        contact.source === 'WhatsApp' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" 
                          : "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                      )}>
                        {contact.source === 'WhatsApp' ? <Smartphone className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
                        {contact.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => openModal(contact)}
                          className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteMutation.mutate(contact.id)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-4 text-sm text-neutral-500 bg-white dark:bg-neutral-900">
          <span className="flex items-center gap-1">1-0 of 0</span>
          <div className="flex items-center gap-1 cursor-pointer">
            25 per page <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{editingId ? 'Edit Contact' : 'Add New Contact'}</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2"><User className="w-4 h-4"/> Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field w-full bg-neutral-50 dark:bg-black" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2"><Smartphone className="w-4 h-4"/> Mobile Number</label>
                <input 
                  type="text" 
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-field w-full bg-neutral-50 dark:bg-black" 
                  placeholder="e.g. +1234567890" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Date of Birth</label>
                <input 
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="input-field w-full bg-neutral-50 dark:bg-black" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2"><Tag className="w-4 h-4"/> Tags (Comma Separated)</label>
                <input 
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="input-field w-full bg-neutral-50 dark:bg-black" 
                  placeholder="e.g. VIP, Lead, Customer" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center border border-neutral-200">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-out Contact Profile Panel */}
      <ContactProfilePanel 
        contact={selectedContact} 
        onClose={() => setSelectedContact(null)} 
      />
    </div>
  );
}
