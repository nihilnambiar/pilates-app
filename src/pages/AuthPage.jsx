// src/pages/AuthPage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser, loginUser, signInWithGoogle, resetPassword } from '../services/authService';

const tabs = ['login', 'signup', 'forgot'];

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (tab === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Enter a valid email';
    if (tab !== 'forgot') {
      if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (tab === 'signup' && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const user = await loginUser({ email: form.email, password: form.password });
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else if (tab === 'signup') {
        await registerUser({ name: form.name, email: form.email, password: form.password });
        toast.success('Account created! Welcome to Vigour 🌸');
        navigate('/dashboard');
      } else {
        await resetPassword(form.email);
        toast.success('Reset link sent! Check your inbox.');
        setTab('login');
      }
    } catch (err) {
      const msg = err.message?.includes('user-not-found') ? 'No account found with this email'
        : err.message?.includes('wrong-password') ? 'Incorrect password'
        : err.message?.includes('email-already-in-use') ? 'Email already registered'
        : err.message?.includes('already booked') ? err.message
        : 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome to Vigour!');
      navigate('/dashboard');
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blush-100 via-blush-200 to-[#e8d5e5]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSJyZ2JhKDIwMCw5MCw3MywwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-60" />

        {/* Floating circles */}
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-white/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '20%' }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full bg-blush-300/30 blur-2xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '20%', right: '10%' }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-full bg-white/80 flex items-center justify-center shadow-soft">
              <span className="font-display text-blush-600 text-xl font-semibold">S</span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-blush-800">Vigour</h1>
              <p className="font-body text-xs text-blush-500 tracking-widest uppercase">Pilates Studio</p>
            </div>
          </div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-5xl font-semibold text-blush-900 leading-tight mb-6">
              Move with<br />
              <em>intention.</em>
            </h2>
            <p className="font-accent text-lg text-blush-700 leading-relaxed italic">
              "In 10 sessions you will feel the difference. In 20 you will see the difference."
            </p>
            <p className="font-body text-sm text-blush-600 mt-2">— Joseph Pilates</p>
          </motion.div>

          {/* Features */}
          <div className="mt-12 space-y-4">
            {[
              { icon: '🌸', text: 'Book classes effortlessly' },
              { icon: '📊', text: 'Track your attendance & progress' },
              { icon: '🏆', text: 'Compete on the monthly leaderboard' },
            ].map(({ icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg">{icon}</span>
                <span className="font-body text-sm text-blush-700">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#fdf9f7]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 flex items-center justify-center">
              <span className="font-display text-white font-semibold">S</span>
            </div>
            <span className="font-display text-xl font-semibold text-blush-700">Vigour</span>
          </div>

          {/* Tab switcher */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              {tab === 'login' && (
                <motion.div key="login-h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="font-display text-3xl font-semibold text-[#2d2420] mb-1">Welcome back</h2>
                  <p className="font-accent text-[#8a7b76] italic">Sign in to your sanctuary</p>
                </motion.div>
              )}
              {tab === 'signup' && (
                <motion.div key="signup-h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="font-display text-3xl font-semibold text-[#2d2420] mb-1">Join Vigour</h2>
                  <p className="font-accent text-[#8a7b76] italic">Begin your wellness journey</p>
                </motion.div>
              )}
              {tab === 'forgot' && (
                <motion.div key="forgot-h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="font-display text-3xl font-semibold text-[#2d2420] mb-1">Reset Password</h2>
                  <p className="font-accent text-[#8a7b76] italic">We'll send you a reset link</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Name (signup only) */}
                {tab === 'signup' && (
                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba8a4]" />
                      <input
                        className={`input-field pl-10 ${errors.name ? 'border-red-300' : ''}`}
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba8a4]" />
                    <input
                      type="email"
                      className={`input-field pl-10 ${errors.email ? 'border-red-300' : ''}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                {tab !== 'forgot' && (
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba8a4]" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => set('password', e.target.value)}
                        autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bba8a4] hover:text-blush-400"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  </div>
                )}

                {/* Confirm Password (signup) */}
                {tab === 'signup' && (
                  <div>
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba8a4]" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => set('confirmPassword', e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Forgot link */}
            {tab === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="font-body text-xs text-blush-500 hover:text-blush-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  {tab === 'login' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Google */}
            {tab !== 'forgot' && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-blush-100" />
                  <span className="font-body text-xs text-[#8a7b76]">or</span>
                  <div className="flex-1 h-px bg-blush-100" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
                    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"/>
                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31Z"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}
          </form>

          {/* Tab switch */}
          <p className="font-body text-sm text-[#8a7b76] text-center mt-6">
            {tab === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setTab('signup')} className="text-blush-600 font-medium hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-blush-600 font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
