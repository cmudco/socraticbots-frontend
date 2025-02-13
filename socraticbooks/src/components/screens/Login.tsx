import { useState } from 'react';
import { login } from '../../services/auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setError('Login failed - check your email and password');
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8">
                <h2 className="text-2xl font-bold">Login</h2>
                
                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded border p-2"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded border p-2"
                    required
                />
                <button 
                    type="submit"
                    className="w-full rounded bg-socratic p-2 text-white hover:bg-opacity-90"
                >
                    Login
                </button>

                <div className="text-center text-sm text-gray-600">
                    Don't have an account? 
                    <button 
                        type="button"
                        onClick={() => window.location.href = '/register'}
                        className="ml-1 text-socratic hover:underline"
                    >
                        Register here
                    </button>
                </div>
            </form>
        </div>
    );
}
