
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const Credits: React.FC = () => {
  const plans = [
    { name: 'Starter', price: 19, credits: 1, bestFor: 'One-off dispute' },
    { name: 'Professional', price: 49, credits: 3, bestFor: 'Small businesses', popular: true },
    { name: 'Enterprise', price: 129, credits: 10, bestFor: 'Property managers' },
  ];

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Credits</h1>
        <div className="mt-2 p-4 bg-blue-600 rounded-[12px] text-white flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Available Credits</p>
            <p className="text-3xl font-black">2</p>
          </div>
          <Badge variant="success">ACTIVE</Badge>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Top Up</h2>
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative overflow-hidden ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500">{plan.bestFor}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">${plan.price}</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mb-4">
              <span className="text-sm font-bold text-slate-600">Credits included</span>
              <span className="text-sm font-black text-blue-600">{plan.credits}</span>
            </div>
            <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full">
              Buy Now
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Credits;
