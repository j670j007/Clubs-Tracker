/*
File: Landing.jsx
Description: Landing page component
Author(s): Anil Thapa
Creation Date: 02/15/2025, last mod: 03/02/2025

Preconditions:
- Vite application running
- User has logged into the application

Input Values:
- Form data for creating a club, Yes/YES/Y/y to confirm deleting a club

Return Values:
- Clubs of the current user-- deleted/created clubs

Error Conditions:
- User has logged out but returned back -- will fail the JWT test
*/

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { useAuth } from '../../context/AuthContext';

import logo from "../../assets/logo.svg"
import CreateClub from "../CreateClub/CreateClub"

function Landing() {
    const navigate = useNavigate(); // (A) useNavigate to move from page to page in a reactive fashion
    const [showCreateClub, setShowCreateClub] = useState(false); // (A) create club state on whether or not the module is displayed
    const [clubs, setClubs] = useState([]); // (A) current clubs of the current user 
    const [clubImages, setClubImages] = useState({}); // (A) images for the club profiles to load into
    const [loading, setLoading] = useState(true); // (A) loading frame while clubs isn't set until the next refresh cycle

    const { logout } = useAuth(); // (A) logout function hooked from the authentication context

    useEffect(() => {
        fetchUserClubs();
    }, []); // (A) on component render, fetch all clubs of the user

    /*
    useEffect(() => {
        console.log('Clubs updated:', clubs);
      }, [clubs]); testing to see if clubs are being updated */

    const fetchUserClubs = async () => {
        setLoading(true); // (A) loading has begun -- set the state so it's rendered in the html as such
        try { // (A) our api call to get clubs
            const response = await fetch('http://127.0.0.1:5000/my-clubs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', // (A) specify our content type
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // (A) only the authorization token is required since backend parses user from the token
                }
            });

            const data = await response.json(); // (A) after fetching, wait for the json to load

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`); // (A) if response code is out of 200s, throw the error along with the status msg
            setClubs(data.clubs); // (A) update the current state of the clubs
            console.log(data.clubs); // debugging print
            const imagePromises = data.clubs.map(club => fetchClubPic(club.club_id));
            await Promise.all(imagePromises);

            console.log(response.message);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false); // (A) regardless of failure or success, lift the loading
        }
    };

    const joinClub = async (code) => {
        try { // (A) our api call to get clubs
            const response = await fetch('http://127.0.0.1:5000/join_club', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // (A) specify our content type
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // (A) only the authorization token is required since backend parses user from the token
                },
                body: JSON.stringify({ // (A) stringify a new object with the correct form names according to the backend
                    invite_code: code
                })
            });

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`); // (A) if response code is out of 200s, throw the error along with the status msg
            fetchUserClubs(); // (A) update clubs again

            console.log(response.message);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleLogout = () => { // (A) basic logout function using the logout() method hooked from the auth contexgt
        logout();
        navigate('/login'); // (A) navigate back to login
    };

    const handleClubSubmission = () => { // (A) basic function for the createclub component to hook onto upon submitting a creation request
        fetchUserClubs(); // (A) fetch the new clubs if there were any
        setShowCreateClub(false); // (A) close the module
    }

    const fetchClubPic = async (clubId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/clubs/${clubId}/profile-picture`, { // (A) get the club picture of a club
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);

            const data = await response.json();
            // console.log(`http://127.0.0.1:5000${data.image_url}`);
            const localImage = `http://127.0.0.1:5000${data.image_url}`;
            setClubImages(prev => ({
                ...prev,
                [clubId]: localImage
            }));
            console.log('b');   
            return true
        } catch (err) {
            setClubImages(prev => ({
                ...prev,
                [clubId]: 'http://127.0.0.1:5000/static/logo.svg'
            }));
            console.log('a');
            return false;
        }
    };

    return (
        <div id="landingDiv">
            <div id="blurFilter"></div>
            <div id="innerDiv">
                <div id="navBar">
                    <div className="leftHeader">
                        <img src={logo}></img>
                        <h1>Club Manager</h1>
                    </div>
                    <ul>
                        <li id="start" onClick={() => navigate('/dashboard')}>Home</li>
                        <li onClick={() => setShowCreateClub(true)}>Create Club</li>
                        <li onClick={() => joinClub(prompt("Enter club code:"))}>Join Club</li>
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
                        <p className="noClubs">You don't have any clubs yet.</p>
                    ) : (
                        <div id="clubsList">
                            {clubs.map(club => (
                                <div key={club.club_id} className="clubNote">
                                    <div className="clubHeader">
                                        {club.is_admin ? (<p className="adminCheck">Admin</p>) : (<p>Member</p>)}
                                        <p className="clubName">{club.name}</p>
                                    </div>
                                    <div className="clubContent" onClick={() => navigate(`/clubs/${club.club_id}`)}>
                                        <img src={clubImages[club.club_id]}></img>
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