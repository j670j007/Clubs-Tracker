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

function Landing () {
    const navigate = useNavigate(); // for future use 
    // right now this is just a WIP, empty (for sprint 2)
    return(
    <div>
        <p>Sprint 2 Development</p>
    </div>
    )
}

export default Landing