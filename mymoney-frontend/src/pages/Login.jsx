import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock Google Popup State
  const [showGoogleMock, setShowGoogleMock] = useState(false);

  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async (mockEmail, mockName, mockPic) => {
    setError('');
    setLoading(true);
    setShowGoogleMock(false);
    try {
      await googleLogin({
        email: mockEmail,
        name: mockName,
        picture: mockPic,
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(circle_at_center,var(--bg-app))]">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md glass-panel p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
            <span className="text-white font-extrabold text-2xl">M</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control your financial destiny with MyMoney
          </p>
        </div>

        {isExpired && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Session expired. Please log in again.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 glass-input"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 glass-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-emerald flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200/10"></div>
          </div>
          <span className="relative px-3 bg-[var(--bg-app)] text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Google OAuth Login Button */}
        <button
          type="button"
          onClick={() => setShowGoogleMock(true)}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200/20 bg-white/5 hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-3 transition cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.7 0 3.2.58 4.4 1.7l3.3-3.3C17.7 1.6 15 0 12 0 7.4 0 3.4 2.6 1.4 6.6l3.9 3C6.3 6.9 8.9 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.6c-.3-.8-.4-1.7-.4-2.6s.1-1.8.4-2.6l-3.9-3C.5 8.1 0 10 0 12s.5 3.9 1.4 5.6l3.9-3z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.2 1.2-3.1 0-5.7-1.9-6.7-4.6L1.4 17.8C3.4 21.4 7.4 24 12 24z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-500 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>

      {/* Simulated Google OAuth Dialog Popup */}
      {showGoogleMock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-2 border-b border-slate-100">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h3 className="text-lg font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500">Choose an account to continue to MyMoney</p>
            </div>

            <div className="p-4 space-y-2 max-h-80 overflow-y-auto bg-slate-50">
              {[
                { name: 'Alex Johnson', email: 'alex.j@gmail.com', pic: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex' },
                { name: 'Sarah Miller', email: 'sarah.m@gmail.com', pic: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah' },
                { name: 'David Chen', email: 'david.c@gmail.com', pic: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=David' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleMockGoogleLogin(acc.email, acc.name, acc.pic)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-100 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img src={acc.pic} alt="Account avatar" className="w-9 h-9 rounded-full bg-slate-100" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{acc.name}</h4>
                      <p className="text-xs text-slate-500">{acc.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Demo account
                  </span>
                </button>
              ))}

              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <span className="relative px-2 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase">Custom Account</span>
              </div>

              {/* Input for custom email to mock any account */}
              <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-2">
                <input
                  type="email"
                  id="customGoogleEmail"
                  placeholder="name@gmail.com"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      const email = e.target.value;
                      const name = email.split('@')[0];
                      handleMockGoogleLogin(email, name, `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`);
                    }
                  }}
                />
                <p className="text-[9px] text-slate-400 text-center">Type email and press Enter to simulate login</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowGoogleMock(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
