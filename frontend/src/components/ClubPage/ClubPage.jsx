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


    const handleDelete = async (id) => { // (A) function to handle deleting when clicking the button
        const userInput = prompt("Are you sure you want to delete this club?"); // (A) prompt to check user input
        if (["yes", "y"].includes(userInput.toLowerCase().trim())) { // (A) if a variation of yes or y, then start the deletion process
            try { // (A) send a DELETE request to the club endpoint
                const response = await fetch(`http://127.0.0.1:5000/clubs/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`); // (A) if status code is out of 200s, return the error

                console.log(response.message); // (A) log message for debugging purposes
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                return false;
            }
        }
    }

    const handleLeave = async (id) => {
        const userInput = prompt("Are you sure you want to leave this club?"); // (A) prompt to check user input
        if (["yes", "y"].includes(userInput.toLowerCase().trim())) { // (A) if a variation of yes or y, then start the leave process
            try { // (A) our api call to get clubs
                const response = await fetch('http://127.0.0.1:5000/leave_club', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json', // (A) specify our content type
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // (A) only the authorization token is required since backend parses user from the token
                    },
                    body: JSON.stringify({ // (A) stringify a new object with the correct form names according to the backend
                        club_id: id
                    })
                });

                if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`); // (A) if response code is out of 200s, throw the error along with the status msg

                console.log(response.message);
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                return false;
            }
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
                        {(clubData.is_admin) ? (
                            <div className="adminSection">
                                <h3>Admin Information</h3>
                                <div className="adminActions">
                                    <button className="editButtonA">Edit Club</button>
                                    <button className="manageButtonA">Manage Members</button>
                                    <button className="manageDeleteA" onClick={() => (handleDelete(clubId))}>Delete</button>
                                    <button className="manageLeaveA" onClick={() => (handleLeave(clubId))}>Leave</button>
                                </div>
                            </div>
                        ) : (
                            <div className="memberSection">
                                <div className="memberActions">
                                    <button className="manageLeaveM" onClick={() => (handleLeave(clubId))}>Leave</button>
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