/*
File: CreateClub.jsx
Description: Create club module component
Author(s): Anil Thapa
Creation Date: 03/02/2025

Preconditions:
- Vite application running
- User has logged into the application

Input Values:
- Form data for creating a club

Return Values:
- Creation of a club

Error Conditions:
- User has logged out but returned back -- will fail the JWT test
*/


import { useState } from 'react';
import './CreateClub.css';

function CreateClub({ onClose, onSubmit }) { // (A) use onclose and onsubmit hooked from parent component to handle diff situations
    const [formData, setFormData] = useState({ // (A) state and forms of the expected form data when submitting a creation request
        name: '',
        description: '',
        code: ''
    });

    const [error, setError] = useState(''); // (A) error state to inform/keep track of 

    const handleChange = (e) => { // (A) handle changes of the form data
        setFormData({
            ...formData, // (A) keep every other part of the current form data state the same
            [e.target.name]: e.target.value // (A) except the one that was changed
        });
    };  

    const handleSubmit = async (e) => { // (A) submission handling function
        e.preventDefault(); // (A) prevent the form from being used while processing
        setError(''); // (A) clear the previous error while submitting the new request

        try { // (A) api call 
            const response = await fetch('http://127.0.0.1:5000/create_club', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // (A) POST with the jwt token
                },
                body: JSON.stringify({ // (A) stringify a new object with the correct form names according to the backend
                    club_name: formData.name,
                    club_desc: formData.description,
                    invite_code: formData.code
                }),
            });

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`); // (A) if outside of 200s, return the error or fault and msg

            console.log(response.message); // (A) log the successful response msg for 
            onSubmit(); // (A) use the hooked function to submit whatever needed
            return true;
        } catch (error) {
            setError(error);
            return false;
        }
    };

    return (
        <div className="moduleBackground">
            <div className="moduleForm">
                <div className="formHeader">
                    <h2>Create New Club</h2>
                    <button className="close" onClick={onClose}>&times;</button>
                </div>
                <div className="body">
                    <form onSubmit={handleSubmit}>
                        <div className="formBox">
                            <label htmlFor="name">Club Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="formBox">
                            <label htmlFor="description">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="formBox">
                            <label htmlFor="code">Invite Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                            />
                            <small>Members will use this code to join your club</small>
                        </div>
                        {error && <p className="errorMsg">{`${error}`}</p>}
                        <div className="formBottom">
                            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateClub