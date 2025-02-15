import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css"

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const success = true;
        // const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div>
            <div>        
                <p> Welcome Back </p>
                <p> Please enter your details to sign in </p>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <div><label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password"> Password </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p>{error}</p>}
                    <button type="submit">Sign In</button>
                </form>
            </div>
            <div>
                <p> Don't have an account? Sign up </p>
            </div>
        </div>

    );
};

export default Login;