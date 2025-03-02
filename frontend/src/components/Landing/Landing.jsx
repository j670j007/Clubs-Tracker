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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { useAuth } from '../../context/AuthContext';

import logo from "../../assets/logo.svg"
import CreateClub from "../CreateClub/CreateClub"

function Landing() {
    const navigate = useNavigate();
    const [showCreateClub, setShowCreateClub] = useState(false);

    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleClubSubmission = () => {
        setShowCreateClub(false);
    }

    return (
        <div id="landingDiv">
            <div id="innerDiv">
                <div id="navBar">
                    <img src={logo}></img>
                    <ul>
                        <li onClick={() => navigate('/dashboard')}>Home</li>
                        <li onClick={() => setShowCreateClub(true)}>Create Club</li>
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
                    {showCreateClub && 
                    <CreateClub onClose={() => setShowCreateClub(false)} onSubmit={handleClubSubmission}></CreateClub>}
                </div>
            </div>
        </div>

    )
}

export default Landing