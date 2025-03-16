import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ClubPage.css';

import logo from "../../assets/logo.svg";

function ClubPage() {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [clubData, setClubData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClubDetails();
    }, [clubId]);

    const fetchClubDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/clubs/${clubId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', // (A) specify our content type
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // (A) only the authorization token is required since backend parses user from the token
                }
            });
            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
            const data = await response.json();
            setClubData(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching club details:", err);
            if (err.status === 403) {
                setError("You don't have permission to view this club.");
            } else if (err.status === 404) {
                setError("Club not found.");
            } else {
                setError("An error occurred while fetching club details.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="loading">Loading club details...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    if (!clubData) {
        return (
            <div className="notFound">
                <h2>Club Not Found</h2>
                <p>The club you're looking for doesn't exist or you don't have access to it.</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div id="landingDiv">
            <div id="blurFilter"></div>
            <div className="innerDiv">
                <div id="navBar">
                    <div className="leftHeader">
                        <img src={logo}></img>
                        <span className="clubDate">
                            <h1>{clubData.name}</h1>
                            {clubData.is_admin && (<span className="adminBadge">Admin</span>)}
                            Created: {clubData.date_added}</span>
                    </div>
                    <ul>
                        <li id="start" onClick={() => navigate('/dashboard')}>Home</li>
                        <li id="end" onClick={handleLogout}>Logout</li>
                    </ul>
                </div>
                <div className="clubContentC">
                    <div className="clubCard">
                        <h2>About this Club</h2>
                        <p className="clubDescription">{clubData.description}</p>
                        {clubData.is_admin && (
                            <div className="adminSection">
                                <h3>Admin Information</h3>
                                <div className="adminActions">
                                    <button className="editButtonA">Edit Club</button>
                                    <button className="manageButtonA">Manage Members</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="clubActivity">
                        <h2>Club Activity</h2>
                        <div className="activityPlaceholder">
                            <p>No recent activity</p>
                        </div>
                    </div>
                    <div className="clubMisc">
                        <div className="inviteBox">
                            <p>Invite Code:</p>
                            <div className="inviteCode">
                                <span>{clubData.invite_code}</span>
                            </div>
                            <p className="inviteHelp">Share this code with others to let them join your club</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClubPage;