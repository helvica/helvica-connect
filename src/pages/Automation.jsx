import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import toast from 'react-hot-toast';

import Sidebar from '../components/Automation/Sidebar';
import { nodeTypes } from '../components/Automation/nodes/CustomNodes';

const API_URL = 'http://localhost:3001/api';

const initialNodes = [
  {
    id: 'node_init_1',
    type: 'trigger',
    data: { label: 'Help' },
    position: { x: 250, y: 150 },
  },
  {
    id: 'node_init_2',
    type: 'message',
    data: { label: 'Hello! How can our support team assist you today?' },
    position: { x: 600, y: 150 },
  }
];

const initialEdges = [
  { id: 'edge_init_1', source: 'node_init_1', target: 'node_init_2' }
];

let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

export default function Automation() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowId, setFlowId] = useState('flow_1');
  const [flowName, setFlowName] = useState('Support Routing Bot');

  useEffect(() => {
    // Load flow from backend
    axios.get(`${API_URL}/flows`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          const flow = res.data[0]; // Load first flow for now
          setFlowId(flow.id);
          setFlowName(flow.name);
          setNodes(typeof flow.nodes === 'string' ? JSON.parse(flow.nodes) : flow.nodes);
          setEdges(typeof flow.edges === 'string' ? JSON.parse(flow.edges) : flow.edges);
        }
      })
      .catch(err => console.error("Failed to load flow", err));
  }, [setNodes, setEdges]);

  const saveFlow = async () => {
    try {
      await axios.post(`${API_URL}/flows`, {
        id: flowId,
        name: flowName,
        nodes: nodes,
        edges: edges,
        is_active: true
      });
      toast.success("Flow saved and activated successfully!");
    } catch (error) {
      toast.error("Failed to save flow.");
      console.error(error);
    }
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: type === 'trigger' ? 'New Keyword' : 'New Message' },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const updateNodeLabel = (newLabel) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          n.data = { ...n.data, label: newLabel };
        }
        return n;
      })
    );
    setSelectedNode((prev) => ({ ...prev, data: { ...prev.data, label: newLabel } }));
  };

  const updateNodeActionType = (newActionType) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          n.data = { ...n.data, actionType: newActionType };
        }
        return n;
      })
    );
    setSelectedNode((prev) => ({ ...prev, data: { ...prev.data, actionType: newActionType } }));
  };

  return (
    <div className="flex flex-col h-full bg-[#EFEAE2] dark:bg-[#111B21]">
      <div className="px-8 py-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{flowName}</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Design chatbots and routing rules visually.</p>
          </div>
          <button onClick={saveFlow} className="btn-primary">Save & Deploy Bot</button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <Sidebar />
          <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-neutral-50 dark:bg-black"
            >
              <Background color="#ccc" gap={16} />
              <Controls className="bg-white dark:bg-neutral-800 fill-neutral-900 dark:fill-neutral-100 border-neutral-200 dark:border-neutral-700 rounded overflow-hidden shadow-sm" />
              <MiniMap 
                 nodeColor={(node) => {
                    switch (node.type) {
                      case 'trigger': return '#6366f1';
                      case 'message': return '#10b981';
                      case 'condition': return '#f59e0b';
                      case 'action': return '#f43f5e';
                      default: return '#eee';
                    }
                 }}
                 className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm"
              />
            </ReactFlow>

            {/* Properties Panel */}
            {selectedNode && (
              <div className="absolute top-4 right-4 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-5 z-10">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  Edit {selectedNode.type} Node
                </h3>
                
                {selectedNode.type === 'trigger' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Trigger Keyword</label>
                    <input 
                      type="text" 
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeLabel(e.target.value)}
                      className="input-field w-full text-sm"
                      placeholder="e.g. Pricing"
                    />
                    <p className="text-xs text-neutral-500 mt-2">If a customer's message contains this keyword, the flow will execute.</p>
                  </div>
                )}

                {selectedNode.type === 'message' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Bot Reply Message</label>
                    <textarea 
                      rows={5}
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeLabel(e.target.value)}
                      className="input-field w-full text-sm"
                      placeholder="Type the automated response..."
                    />
                    <p className="text-xs text-neutral-500 mt-2">This text will be sent to the customer automatically.</p>
                  </div>
                )}
                
                {selectedNode.type === 'condition' && (
                  <div>
                    <p className="text-sm text-neutral-500">Condition configuration coming soon.</p>
                  </div>
                )}

                {selectedNode.type === 'action' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">System Action</label>
                    <select 
                      value={selectedNode.data.actionType || 'route'}
                      onChange={(e) => updateNodeActionType(e.target.value)}
                      className="input-field w-full text-sm"
                    >
                      <option value="route">Route to Human Agent</option>
                      <option value="close">Close Chat</option>
                    </select>
                    <p className="text-xs text-neutral-500 mt-2">
                      {selectedNode.data.actionType === 'close' 
                        ? 'Instantly sets the chat status to Closed.' 
                        : 'Sets the chat status to Open and alerts agents.'}
                    </p>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
