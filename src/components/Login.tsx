import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card bg-base-200 w-96 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="text-2xl font-bold text-primary mb-1">🪑 نصرالله فرنیچر</h1>
          <p className="text-base-content/60 text-sm mb-4">سیستم مدیریت یکپارچه</p>
          {error && <div className="alert alert-error text-sm py-2">{error}</div>}
          <label className="input input-bordered flex items-center gap-2 w-full">
            <User className="h-[1em] opacity-50" />
            <input
              type="text"
              className="grow"
              placeholder="نام کاربری"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 w-full">
            <Lock className="h-[1em] opacity-50" />
            <input
              type="password"
              className="grow"
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </label>
          <button className="btn btn-primary w-full mt-2" onClick={handleLogin}>
            ورود به سیستم
          </button>
          <p className="text-xs text-base-content/40 mt-2">نام کاربری: admin | رمز: admin</p>
        </div>
      </div>
    </div>
  );
};
