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

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { useAuth } from '../../context/AuthContext';

import logo from "../../assets/logo.svg"
import CreateClub from "../CreateClub/CreateClub"

function Landing() {
    const navigate = useNavigate();
    const [showCreateClub, setShowCreateClub] = useState(false);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user, logout } = useAuth();

    useEffect(() => {
        fetchUserClubs();
    }, []);

    /*
    useEffect(() => {
        console.log('Clubs updated:', clubs);
      }, [clubs]); testing to see if clubs are being updated */

    const fetchUserClubs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/my-clubs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
            setClubs(data.clubs);
            console.log(data.clubs);

            console.log(response.message);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/clubs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);

            console.log(response.message);
            fetchUserClubs();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleClubSubmission = () => {
        fetchUserClubs();
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
                    {loading ? (
                        <p className="loading">Loading your clubs...</p>
                    ) : clubs.length === 0 ? (
                        <p className="no-clubs">You don't have any clubs yet.</p>
                    ) : (
                        <div id="clubsList">
                            {clubs.map(club => (
                                <div key={club.club_id} className="clubNote">
                                    <div className="clubHeader">
                                        {club.is_admin ? (<p className="adminCheck">Admin</p>) : (<p>Member</p>)}
                                        {club.is_admin && (<p className="adminDelete" onClick={() => (handleDelete(club.club_id))}>X</p>)}
                                    </div>
                                    <div className="clubContent">
                                        <p className="clubName">{club.name}</p>
                                        <p className="clubDesc">{club.club_desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {showCreateClub &&
                        <CreateClub onClose={() => setShowCreateClub(false)} onSubmit={handleClubSubmission}></CreateClub>}
                </div>
            </div>
        </div>

    )
}

export default Landing