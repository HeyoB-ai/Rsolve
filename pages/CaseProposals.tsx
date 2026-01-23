
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProposalCard } from '../components/ui/ProposalCard';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';

const CaseProposals: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const proposals = [
    { id: 'p1', amount: 450, description: "One-time payment to cover material costs and labor for the door repair. This includes a 30-day warranty on work.", status: 'pending' as const, proposerName: 'Alex Smith' },
    { id: 'p2', amount: 600, description: "Full replacement of the door unit as per original specifications.", status: 'rejected' as const, proposerName: 'Jordan' },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(`/cases/${id}`)} className="p-2 -ml-2 text-slate-400">
          <svg className="w-6 h-6 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900">Proposals</h1>
      </header>

      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Proposals</h2>
          {proposals.filter(p => p.status === 'pending').map(p => (
            <ProposalCard key={p.id} proposal={p} isRespondent={true} />
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">History</h2>
          {proposals.filter(p => p.status !== 'pending').map(p => (
            <div key={p.id} className="opacity-60">
              <ProposalCard proposal={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" className="w-full bg-white">
          <ICONS.Plus className="w-4 h-4 mr-2" /> Create Counter Proposal
        </Button>
      </div>
    </div>
  );
};

export default CaseProposals;
