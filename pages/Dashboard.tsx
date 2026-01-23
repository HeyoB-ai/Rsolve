
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const cases = [
    { id: '1', title: 'Property Damage - Unit 4B', status: 'negotiation', date: '2 days ago', partner: 'Alex Smith' },
    { id: '2', title: 'Refund for Freelance Work', status: 'active', date: '5 days ago', partner: 'Design Studio' },
    { id: '3', title: 'Noise Complaint Mediation', status: 'closed', date: '2 weeks ago', partner: 'Neighbor' },
  ];

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Cases</h1>
          <p className="text-sm text-slate-500">Welcome back, Jordan</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
          <img src="https://picsum.photos/100/100" alt="User" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-blue-600 border-none text-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Active Cases</p>
          <p className="text-3xl font-black">2</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Savings</p>
          <p className="text-3xl font-black text-slate-900">$1.2k</p>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h2>
          <button className="text-xs font-bold text-blue-600">See all</button>
        </div>

        {cases.map((c) => (
          <Card key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{c.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{c.partner}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-400">{c.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={c.status === 'closed' ? 'neutral' : c.status === 'negotiation' ? 'warning' : 'primary'}>
                {c.status}
              </Badge>
              <ICONS.ChevronRight className="text-slate-300" />
            </div>
          </Card>
        ))}
      </div>

      <Button 
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-xl z-10 md:bottom-10" 
        onClick={() => navigate('/cases/new')}
      >
        <ICONS.Plus />
      </Button>
    </div>
  );
};

export default Dashboard;
