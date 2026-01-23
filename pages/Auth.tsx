
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 bg-blue-600 rounded-[12px] items-center justify-center mb-6">
            <span className="text-2xl font-black text-white">R</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {mode === 'signin' ? 'Log in to manage your active disputes' : 'Join Rsolve to resolve conflicts fairly'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
          <Input label="Email Address" type="email" placeholder="name@email.com" required />
          <Input label="Password" type="password" placeholder="••••••••" required />
          
          <Button size="lg" className="w-full mt-2">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full">Google</Button>
          <Button variant="outline" className="w-full">Apple</Button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
