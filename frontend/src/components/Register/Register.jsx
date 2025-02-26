/*
File: Register.jsx
Description: Register form component
Author(s): Anil Thapa
Creation Date: 02/15/2025

Preconditions:
- Vite application running

Input Values:
- First name, Last name, Email, Username, Password

Return Values:
- A successful registration or a failed registration. Succesful will return the user to the login page.

Error Conditions:
- Bad inputs
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

function Register () {
    const [formData, setFormData] = useState({ // (A) form data with a set format
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(''); // (A) error state for error management, when present will reveal html paragraph
    const { register } = useAuth(); // (A) register function taken by hooking onto the auth context we defined
    const navigate = useNavigate(); // (A) navigate function without refreshing the page

    const handleChange = (e) => { // (A) whenever there is a change in our inputs, we keep all parameters but modify the one we changed
        setFormData({
            ...formData, // (A) shorthand to leave everything else the same
            [e.target.name]: e.target.value // (A) target only the value we changed
        });
    };

    const handleSubmit = async (e) => { // (A) handle submission
        e.preventDefault(); // (A) prevent keystrokes while handling
        setError(''); // (A) if there was an error before, reset it while handling the new submission
        
        const success = await register({ // wait for register request while modifying parameter names to match Flask API
          first_name: formData.firstName,
          last_name: formData.lastName,
          login_id: formData.username,
          email: formData.email,
          password: formData.password
        });

        if (success) { // (A) if successful (success = register() returns True)
            navigate('/login'); // (A) go to login page
        } else {
            setError('Registration failed. Please try again.');
        }
    };
    
    // this is just HTML
    return ( 
        <div id="fixDiv">
            <div className="registerForm">
                <div>
                    <h1>Create Account</h1>
                </div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <div id="names">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />  
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit">Register</button>
                    </form>
                </div>
                <div className="login">
                    <p>Already have an account? <a href="/login">Login here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Register;