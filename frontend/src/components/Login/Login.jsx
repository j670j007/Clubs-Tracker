/*
File: Login.jsx
Description: Login form component
Author(s): Anil Thapa
Creation Date: 02/15/2025

Preconditions:
- Vite application running

Input Values:
- Username, Password

Return Values:
- A successful login or a failed login. Successful login leads to the landing page

Error Conditions:
- Bad inputs
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import "./Login.css"

function Login() {
    const [formData, setFormData] = useState({ // (A) login form only requires username and password
        username: '',
        password: ''
      });
    const [error, setError] = useState(''); // (A) error state management with html paragraph hidden depending on existing cond
    const { login } = useAuth(); // (A) login function taken by hooking onto the authentication context
    const navigate = useNavigate(); // (A) navigate function used to modify pages without refreshing

    const handleChange = (e) => { // (A) whenever there is a change in our inputs, we modify only it, and leave the rest the same
        setFormData({
          ...formData, // (A) shorthand for leaving everything else the same
          [e.target.name]: e.target.value // (A) modify only the name that changed
        });
      };

    const handleSubmit = async (e) => { // (A) submission handling
        e.preventDefault(); // (A) stop any inputs or changes to fields when we submit
        setError(''); // (A) reset error on this new submission

        const success = await login({ // success is dependent on login id and password (we map to the API expectations)
            login_id: formData.username,
            password: formData.password
        });

        if (success) { // (A) login() returns true or false, success means a token/data was generated so we move forwaard
            navigate('/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };
    // (A) this is just HTML
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
                    {error && <p className="error-message">{error}</p>}
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