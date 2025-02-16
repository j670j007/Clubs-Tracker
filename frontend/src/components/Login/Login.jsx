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
        <div class="loginForm">
            <div id="topHeader">        
                <h1> Welcome Back </h1>
                <h3> Please enter your details to sign in </h3>
            </div>
            <div id="submission">
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
            <div id="signUp">
                <h3> Don't have an account? <a href="/register">Sign Up</a></h3>
            </div>
        </div>

    );
};

export default Login;