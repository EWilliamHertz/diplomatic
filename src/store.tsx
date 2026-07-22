import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Argument {
  id: string;
  type: 'pro' | 'con';
  text: string;
  author: string;
}

export interface FollowUp {
  id: string;
  text: string;
  author: string;
  date: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'active' | 'approved' | 'rejected';
  votes: { for: number; against: number; abstain: number };
  totalMembers: number;
  userVote: 'for' | 'against' | 'abstain' | null;
  arguments: Argument[];
  followUps?: FollowUp[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending';
}

export interface Message {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  strategy: string;
  period: string;
  status: 'planned' | 'active' | 'completed';
}

export interface Calculation {
  id: string;
  title: string;
  formula: string;
  result: string;
  createdAt: string;
}

interface StoreState {
  balance: number;
  proposals: Proposal[];
  transactions: Transaction[];
  messages: Message[];
  leads: any[];
  customers: any[];
  campaigns: Campaign[];
  calculations: Calculation[];
  orders: any[];
  members: any[];
  addProposal: (p: Partial<Proposal>) => Promise<void>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>;
  voteOnProposal: (id: string, choice: 'for'|'against'|'abstain') => Promise<void>;
  addArgument: (proposalId: string, arg: Argument) => Promise<void>;
  addFollowUp: (proposalId: string, f: FollowUp) => Promise<void>;
  addMessage: (m: Message) => void;
  addCampaign: (c: Campaign) => Promise<void>;
  addTransaction: (t: Partial<Transaction>) => Promise<void>;
  importLeads: (data: any[]) => Promise<void>;
  importCustomers: (data: any[]) => Promise<void>;
  importOrders: (data: any[]) => Promise<void>;
  updateLeadStatus: (id: string, status: string) => Promise<void>;
  bulkUpdateLeadStatus: (ids: string[], status: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  bulkUpdateOrderStatus: (ids: string[], status: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  bulkDeleteLeads: (ids: string[]) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  bulkDeleteOrders: (ids: string[]) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  bulkDeleteCustomers: (ids: string[]) => Promise<void>;
  addCalculation: (c: Partial<Calculation>) => Promise<void>;
  addMemberManually: (data: any) => Promise<void>;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      setProposals(data.proposals || []);
      setTransactions(data.transactions || []);
      setCampaigns(data.campaigns || []);
      setLeads(data.leads || []);
      setCustomers(data.customers || []);
      setOrders(data.orders || []);
      setMembers(data.members || []);
      
      const calcRes = await fetch('/api/calculations');
      if (calcRes.ok) setCalculations(await calcRes.json());
      
      const bal = (data.transactions || []).reduce((acc: number, t: any) => acc + t.amount, 0);
      setBalance(bal);
    } catch (e) {
      console.error('Failed to sync data', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addCalculation = async (c: Partial<Calculation>) => {
    await fetch('/api/calculations', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(c) });
    await refreshData();
  };

  const importOrders = async (data: any[]) => {
    await fetch('/api/orders/import', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    await refreshData();
  };
  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}/status`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ status }) });
    await refreshData();
  };
  const bulkUpdateOrderStatus = async (ids: string[], status: string) => {
    await fetch('/api/orders/bulk-status', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids, status }) });
    await refreshData();
  };
  const deleteOrder = async (id: string) => {
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    await refreshData();
  };
  const bulkDeleteOrders = async (ids: string[]) => {
    await fetch('/api/orders/bulk-delete', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids }) });
    await refreshData();
  };

  const importLeads = async (data: any[]) => {
    await fetch('/api/leads/import', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    await refreshData();
  };
  const importCustomers = async (data: any[]) => {
    await fetch('/api/customers/import', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    await refreshData();
  };
  const updateLeadStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}/status`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ status }) });
    await refreshData();
  };
  const bulkUpdateLeadStatus = async (ids: string[], status: string) => {
    await fetch('/api/leads/bulk-status', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids, status }) });
    await refreshData();
  };
  const deleteLead = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    await refreshData();
  };
  const bulkDeleteLeads = async (ids: string[]) => {
    await fetch('/api/leads/bulk-delete', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids }) });
    await refreshData();
  };
  const deleteCustomer = async (id: string) => {
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    await refreshData();
  };
  const bulkDeleteCustomers = async (ids: string[]) => {
    await fetch('/api/customers/bulk-delete', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids }) });
    await refreshData();
  };
  const addCampaign = async (c: Campaign) => {
    await fetch('/api/campaigns', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(c) });
    await refreshData();
  };

  const addTransaction = async (t: Partial<Transaction>) => {
    await fetch('/api/transactions', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(t) });
    await refreshData();
  };

  const addProposal = async (p: Partial<Proposal>) => {
    await fetch('/api/proposals', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(p) });
    await refreshData();
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    await fetch(`/api/proposals/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(updates) });
    await refreshData();
  };

  const voteOnProposal = async (id: string, choice: 'for'|'against'|'abstain') => {
    await fetch(`/api/proposals/${id}/vote`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ choice }) });
    await refreshData();
  };

  const addArgument = async (proposalId: string, arg: Argument) => {
    await fetch(`/api/proposals/${proposalId}/arguments`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(arg) });
    await refreshData();
  };

  const addFollowUp = async (proposalId: string, f: FollowUp) => {
    await fetch(`/api/proposals/${proposalId}/followups`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(f) });
    await refreshData();
  };

  const addMessage = (m: Message) => {
    setMessages([m, ...messages]);
  };

  const addMemberManually = async (data: any) => {
    await fetch('/api/members/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  return (
    <StoreContext.Provider value={{ 
      balance, proposals, transactions, messages, leads, customers, campaigns, calculations, orders, members,
      addProposal, updateProposal, voteOnProposal, addArgument, addFollowUp, addMessage, addCampaign, addTransaction, addCalculation, importLeads, importCustomers, importOrders, updateLeadStatus, bulkUpdateLeadStatus, updateOrderStatus, bulkUpdateOrderStatus, deleteLead, bulkDeleteLeads, deleteOrder, bulkDeleteOrders, deleteCustomer, bulkDeleteCustomers, addMemberManually
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
