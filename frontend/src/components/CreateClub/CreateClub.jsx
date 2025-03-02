import { useState } from 'react';
import './CreateClub.css';

function CreateClub() {
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
            onSuccess(console.log(response.message));
            return true;
        } catch (error) {
            setError(error);
            return false;
        }
    };

    return (
        <div>
        </div>
    );
}

export default CreateClub