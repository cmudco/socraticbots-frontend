import { useState } from 'react';
import { register } from '../../services/auth';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(email, password);
        } catch (err) {
            setError('Registration failed - email might be taken');
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8">
                <h2 className="text-2xl font-bold">Register</h2>
                
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
                    Register
                </button>
            </form>
        </div>
    );
}
