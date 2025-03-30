/*
File: ClubPage.jsx
Description: Club view
Author(s): Anil Thapa
Creation Date: 03/02/2025

Preconditions:
- Vite application running
- User has logged into the application
- User is in the club

Input Values:
- Club id in the url

Return Values:
- Club dashboard

Error Conditions:
- N/A so far
*/


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ClubPage.css';

import logo from "../../assets/logo.svg";
import editIcon from "../../assets/edit.svg";

function ClubPage() {
    const { clubId } = useParams(); // (A) get the clubId from the link used 
    const navigate = useNavigate(); // (A) use navigate to move between pages easier
    const { logout } = useAuth(); // (A) get the logout function by hooking back to our authentication context
    const [clubData, setClubData] = useState(null); // (A) state for club data when we call our backend
    const [loading, setLoading] = useState(true); // (A) handle midway loads
    const [error, setError] = useState(null); // (A) error checks

    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(() => {
        fetchClubDetails();
    }, [clubId]); // (A) when clubId loads, fetch club information

    const fetchClubDetails = async () => {
        setLoading(true); // (A) set our loading state to true, will show intermeditary html
        try {
            const response = await fetch(`http://127.0.0.1:5000/clubs/${clubId}`, { // (A) send request with clubid in the link
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', // (A) specify our content type
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // (A) only the authorization token is required since backend parses user from the token
                }
            });
            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
            const data = await response.json();
            setClubData(data);
            setEditedDescription(data.description);
            setError(null);
        } catch (err) {
            console.error("Error fetching club details:", err); // (A) responds accordingly to the status codes in the backend
            if (err.status === 403) {
                setError("You don't have permission to view this club.");
            } else if (err.status === 404) {
                setError("Club not found.");
            } else {
                setError("An error occurred while fetching club details.");
            }
        } finally {
            setLoading(false); // (A) loaded (real mem) or not, remove intermediatry 
        }
    };

    // (A) Description editing functionality
    const saveDescription = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/clubs/${clubId}/description`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    club_desc: editedDescription
                })
            });

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);

            // Update local state
            setClubData({
                ...clubData,
                description: editedDescription
            });
            setIsEditingDescription(false);
        } catch (err) {
            console.error("Error updating description:", err);
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

    const handleLogout = () => { // (A) handle logout, remove session, navigate back to login
        logout();
        navigate('/login');
    };

    if (loading) { // (A) login intermediatery html
        return <div className="loading">Loading club details...</div>;
    }

    if (error) { // (A) in the case of an error, fill page with this
        return (
            <div className="error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    if (!clubData) { // (A) if there is no club data, then give user response
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
                            {(clubData.is_admin) ? (<span className="adminBadge">Admin</span>) : (<span className="memberBadge">Member</span>)}
                            Created: {clubData.date_added}</span>
                    </div>
                    <ul>
                        <li id="start" onClick={() => navigate('/dashboard')}>Home</li>
                        <li id="end" onClick={handleLogout}>Logout</li>
                    </ul>
                </div>
                <div className="clubContentC">
                    <div className="clubCard">
                        <div className="clubCardHeader">
                            <h2>About this Club</h2>
                            {clubData.is_admin && (<button className="editClubButton" onClick={() => setIsEditingDescription(true)}> <img src={editIcon} /> </button>)}
                        </div>
                        {isEditingDescription ? (
                            <div className="editSection">
                                <textarea
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    className="editTextarea"
                                />
                                <div className="editActions">
                                    <button onClick={() => setIsEditingDescription(false)} className="cancelBtn"> Cancel </button>
                                    <button onClick={saveDescription} className="saveBtn"> Save </button>
                                </div>
                            </div>
                        ) : (
                            <p className="clubDescription">{clubData.description}</p>
                        )}
                        {(clubData.is_admin) ? (
                            <div className="adminSection">
                                <h3>Admin Information</h3>
                                <div className="adminActions">
                                    <button className="editButtonA">Edit Club</button>
                                    {/* <button className="manageButtonA">Manage Members</button> */}
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
                        <div className="clubCardHeader">
                            <h2>Club Events</h2>
                            {clubData.is_admin && (<button className="editClubButton"> <img src={editIcon} /> </button>)}
                        </div>
                        <div className="activityPlaceholder">
                            <p>No recent events</p>
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