import { useState } from 'react';
import { register } from '../../services/auth';
import { verifyAccessCode } from '../../services/accessCode';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // First verify access code
            const verification = await verifyAccessCode(accessCode);
            
            if (!verification.valid) {
                setError(verification.message || 'Invalid access code');
                setIsLoading(false);
                return;
            }

            // If access code is valid, proceed with registration
            await register(email, password);
            // Registration successful - user will be automatically logged in
        } catch (err: any) {
            setError(err.message || 'Registration failed - please check your details');
            console.error(err);
        } finally {
            setIsLoading(false);
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
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Access Code"
                    className="w-full rounded border p-2"
                    required
                />

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
                    disabled={isLoading}
                    className="w-full rounded bg-socratic p-2 text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}
