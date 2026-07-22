import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Argument {
  id: string;
  type: 'pro' | 'con';
  text: string;
  author: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  amount: number; // Added amount for treasury effect
  status: 'active' | 'approved' | 'rejected';
  votes: { for: number; against: number; abstain: number };
  totalMembers: number;
  userVote: string | null;
  arguments: Argument[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // negative for expense, positive for income
  status: 'completed' | 'pending';
}

export interface Message {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface StoreState {
  balance: number;
  proposals: Proposal[];
  transactions: Transaction[];
  messages: Message[];
  addProposal: (p: Proposal) => void;
  voteOnProposal: (id: string, choice: 'for'|'against'|'abstain') => void;
  addArgument: (proposalId: string, arg: Argument) => void;
  addMessage: (m: Message) => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const addProposal = (p: Proposal) => {
    setProposals([p, ...proposals]);
  };

  const addMessage = (m: Message) => {
    setMessages([m, ...messages]);
  };

  const addArgument = (proposalId: string, arg: Argument) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;
      return { ...p, arguments: [...p.arguments, arg] };
    }));
  };

  const voteOnProposal = (id: string, choice: 'for' | 'against' | 'abstain') => {
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.userVote) return p; // Cannot vote twice

      const newVotes = { ...p.votes, [choice]: p.votes[choice] + 1 };
      const majorityThreshold = Math.floor(p.totalMembers / 2);
      let newStatus = p.status;
      
      if (newVotes.for > majorityThreshold) {
        newStatus = 'approved';
      } else if (newVotes.against > majorityThreshold) {
        newStatus = 'rejected';
      }

      // Automatically trigger transaction if approved and it has financial impact
      if (newStatus === 'approved' && p.status === 'active') {
        if (p.amount !== 0) {
          // Negative amount because a budget proposal usually means we spend money
          const txAmount = -Math.abs(p.amount);
          const newTx: Transaction = {
            id: Math.random().toString(36).substring(7),
            date: new Date().toISOString().split('T')[0],
            description: `Approved Proposal: ${p.title}`,
            amount: txAmount,
            status: 'completed'
          };
          setTransactions(prevTx => [newTx, ...prevTx]);
          setBalance(b => b + txAmount);
        }
      }

      return {
        ...p,
        votes: newVotes,
        status: newStatus,
        userVote: choice
      };
    }));
  };

  return (
    <StoreContext.Provider value={{ balance, proposals, transactions, messages, addProposal, voteOnProposal, addArgument, addMessage }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
