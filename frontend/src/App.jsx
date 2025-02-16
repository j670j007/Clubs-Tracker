/*
File: App.jsx
Description: Frontend Application for Club Manager
Author(s): Anil Thapa
Creation Date: 02/15/2025

Preconditions:
- Dependencies in package-lock.json and package.json installed
- Node installed

Input Values:
- User inputs through interactions

Return Values:
- Feedbacks the user based on what they expect to see 

Error Conditions:
- Intentionally messing with routing
*/

import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'; // Routing package
import { AuthProvider } from './context/AuthContext'; // Our Authentication context used to maintain a session while browsing
import Login from './components/Login/Login';
import Register from './components/Register/Register'
import Landing from './components/Landing/Landing'
import './App.css'

function App() {
  return (
    <Router> {/* Router to wrap around */}
      <AuthProvider> {/* Authentication context for the components to inherit auth needs */}
        <Routes> {/* Routes setup */}
          <Route path="/login" element={<><div className="background"></div><Login/></>}/>
          <Route path="/register" element={<><div className="background"></div><Register/></>}/>
          <Route path="/dashboard" element={<><div className="background"></div><Landing/></>}/>
          <Route path="*" element={<Navigate to ="/login" replace/>}/> {/* this will be changed with some safety later */}
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
