
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ICONS } from '../constants';

const Settings: React.FC = () => {
  const sections = [
    { title: 'Account', items: ['Personal Info', 'Password', 'Notifications'] },
    { title: 'Billing', items: ['Payment Methods', 'Billing History'] },
    { title: 'Legal', items: ['Privacy Policy', 'Terms of Service'] },
  ];

  return (
    <div className="p-6">
      <header className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-[16px] bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
          <img src="https://picsum.photos/200/200" alt="Avatar" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm font-medium text-slate-500">Jordan Peterson</p>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{section.title}</h2>
            <Card noPadding className="divide-y divide-slate-100">
              {section.items.map((item) => (
                <button key={item} className="w-full px-4 py-4 flex justify-between items-center text-sm font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                  {item}
                  <ICONS.ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </Card>
          </div>
        ))}
        
        <div className="pt-4">
          <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            Sign Out
          </Button>
          <p className="text-center text-[10px] font-bold text-slate-400 mt-8 uppercase tracking-widest">
            Rsolve Version 1.0.4 (Build 402)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
