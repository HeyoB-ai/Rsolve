
export type CaseStatus = 'draft' | 'active' | 'negotiation' | 'agreement' | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'initiator' | 'respondent' | 'mediator';
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  createdAt: string;
  initiatorId: string;
  respondentId: string;
  category: string;
}

export interface Message {
  id: string;
  caseId: string;
  senderId: string;
  text: string;
  translatedText?: string;
  timestamp: string;
  type: 'text' | 'system' | 'proposal';
}

export interface Proposal {
  id: string;
  caseId: string;
  proposerId: string;
  description: string;
  amount?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
