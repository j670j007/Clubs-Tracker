import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css"

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
      });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value
        });
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const success = true;
        // const success = await login(formData.username, formData.password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="loginForm">
            <div id="topHeader">        
                <h1> Welcome Back </h1>
                <h3> Please enter your details to sign in </h3>
            </div>
            <div id="submission">
                <form onSubmit={handleSubmit}>
                    <div><label htmlFor="email">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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