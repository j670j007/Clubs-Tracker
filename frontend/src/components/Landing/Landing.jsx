/*
File: Landing.jsx
Description: Landing page component
Author(s): Anil Thapa
Creation Date: 02/15/2025

Preconditions:
- Vite application running

Input Values:
- N/A

Return Values:
- Plain text for WIP

Error Conditions:
- N/A
*/

import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { useAuth } from '../../context/AuthContext';

import logo from "../../assets/logo.svg"


function Landing() {
    const navigate = useNavigate(); 
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div id="landingDiv">
            <div id="innerDiv">
                <div id="navBar">
                    <img src={logo}></img>
                    <ul>
                        <li onClick={() => navigate('/dashboard')}>Home</li>
                        <li>Create Club</li>
                        <li id="end" onClick={handleLogout}>Logout</li>
                    </ul>
                </div>
                <div id="landingPage">
                    {/*<div className="clubNote">
                        <div className="clubHeader">
                            <p>Test</p>
                        </div>
                        <div className="clubContent">
                            <p>as duiasdhaisdhusad</p>
                        </div>
                    </div>*/}
                </div>
            </div>
        </div>

    )
}

export default Landing