import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, MoreVertical, Shield, User, X, Trash2, Edit2, Mail, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';

export default function Agents() {
  const { API_URL } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Agent');
  const [status, setStatus] = useState('Active');

  // Fetch Agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/agents`);
      return res.data;
    }
  });

  // Create Agent
  const createMutation = useMutation({
    mutationFn: async (newAgent) => {
      const res = await axios.post(`${API_URL}/agents`, newAgent);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Agent added successfully');
      closeModal();
    }
  });

  // Update Agent
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const res = await axios.put(`${API_URL}/agents/${id}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Agent updated successfully');
      closeModal();
    }
  });

  // Delete Agent
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${API_URL}/agents/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Agent removed');
    }
  });

  const openModalForNew = () => {
    setEditingAgent(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Agent');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openModalForEdit = (agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setEmail(agent.email);
    setRole(agent.role);
    setStatus(agent.status);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, name, email, role, status });
    } else {
      createMutation.mutate({ name, email, password, role, status });
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-neutral-50 dark:bg-black">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-500" />
            Agent Management
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your team's access and roles within Helvica Connect.</p>
        </div>
        <button onClick={openModalForNew} className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" /> Add New Agent
        </button>
      </div>

      {/* Search Bar */}
      <div className="card bg-white dark:bg-neutral-900 mb-6 p-4 border border-neutral-200 dark:border-neutral-800 flex items-center shrink-0">
        <Search className="h-5 w-5 text-neutral-400 mr-3" />
        <input 
          type="text"
          placeholder="Search agents by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-neutral-900 dark:text-white w-full text-sm"
        />
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-hidden card bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-800/50 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
              <tr>
                <th className="whitespace-nowrap px-6 py-4 font-semibold">Agent Details</th>
                <th className="whitespace-nowrap px-6 py-4 font-semibold">Role</th>
                <th className="whitespace-nowrap px-6 py-4 font-semibold">Status</th>
                <th className="whitespace-nowrap px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-8 text-neutral-500">Loading agents...</td></tr>
              ) : filteredAgents.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-neutral-500">No agents found.</td></tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-white">{agent.name}</div>
                          <div className="text-neutral-500 flex items-center text-xs mt-0.5">
                            <Mail className="w-3 h-3 mr-1" /> {agent.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                        {agent.role === 'Admin' ? <Shield className="w-4 h-4 text-emerald-500" /> : <User className="w-4 h-4 text-blue-500" />}
                        {agent.role}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
                        agent.status === 'Active' 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                      )}>
                        {agent.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {agent.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModalForEdit(agent)} className="p-2 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(agent.id)} className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingAgent ? 'Edit Agent' : 'Add New Agent'}
              </h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field w-full bg-neutral-50 dark:bg-black" 
                  placeholder="e.g. Jane Doe" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field w-full bg-neutral-50 dark:bg-black" 
                  placeholder="jane@helvica.com" 
                />
              </div>

              {!editingAgent && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field w-full bg-neutral-50 dark:bg-black" 
                    placeholder="Enter secure password" 
                  />
                  <p className="text-xs text-neutral-500 mt-1">This agent will use this password to log in.</p>
                </div>
              )}
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Role</label>
                  <select 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="input-field w-full bg-neutral-50 dark:bg-black"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="input-field w-full bg-neutral-50 dark:bg-black"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1 justify-center">
                  {editingAgent ? 'Save Changes' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
