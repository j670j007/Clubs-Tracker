import { useState } from 'react';
import './CreateClub.css';

function CreateClub({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:5000/create_club', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    club_name: formData.name,
                    club_desc: formData.description,
                    invite_code: formData.code
                }),
            });

            if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);

            console.log(response.message);
            onSubmit();
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