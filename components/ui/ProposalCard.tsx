
import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { ICONS } from '../../constants';

interface ProposalCardProps {
  proposal: {
    id: string;
    amount?: number;
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
    proposerName: string;
  };
  onVote?: (id: string, accept: boolean) => void;
  isRespondent?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onVote, isRespondent }) => {
  return (
    <Card className="border-l-4 border-l-amber-400">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Proposal from {proposal.proposerName}</h4>
          <p className="text-xs text-slate-500">Drafted via Mediator Assistant</p>
        </div>
        <Badge variant={proposal.status === 'pending' ? 'warning' : proposal.status === 'accepted' ? 'success' : 'error'}>
          {proposal.status.toUpperCase()}
        </Badge>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg mb-4">
        {proposal.amount && (
          <div className="text-2xl font-bold text-slate-900 mb-1">
            ${proposal.amount.toLocaleString()}
          </div>
        )}
        <p className="text-sm text-slate-600 line-clamp-3 italic">
          "{proposal.description}"
        </p>
      </div>

      {proposal.status === 'pending' && isRespondent && (
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-red-200 text-red-600"
            onClick={() => onVote?.(proposal.id, false)}
          >
            <ICONS.X className="w-4 h-4 mr-1" /> Reject
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => onVote?.(proposal.id, true)}
          >
            <ICONS.Check className="w-4 h-4 mr-1" /> Accept
          </Button>
        </div>
      )}
    </Card>
  );
};
