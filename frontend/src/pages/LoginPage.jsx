import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send credentials as JSON in POST body
      const res = await api.post('/login', { email, password });

      const { access_token, allowed_sites } = res.data;

      // Store JWT and allowed sites
      localStorage.setItem('token', access_token);
      localStorage.setItem('allowed_sites', JSON.stringify(allowed_sites));

      // Redirect user to site selection page
      navigate('/sites');
    } catch (err) {
      // Capture backend error or fallback
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

        {error && (
          <p className="text-red-600 text-center">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </p>
        )}

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
