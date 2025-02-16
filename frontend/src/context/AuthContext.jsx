/*
File: AuthContext.jsx
Description: Register form component
Author(s): Anil Thapa
Creation Date: 02/15/2025

Preconditions:
- Vite application running
- Children that can access the context

Input Values:
- Will take in userData from children (login data and register data are dependent on their respctive forms)

Return Values:
- Results of API calls from the userData passed on by children
- Handles user state and user login

Error Conditions:
- Bad inputs
*/

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null); // (A) create our initial context object

export const AuthProvider = ({ children }) => { // (A) create a context provider component that takes in children that can hook
    const [user, setUser] = useState(null); // (A) the user data state that we want to manage throughout the application

    const login = async (userData) => { // (A) login function 
        try {
            const response = await fetch('http://127.0.0.1:5000/login', { // (A) we POST the userData (login_id, password) to our login endpoint on Flask
                method: 'POST', // (A) method
                headers: { 'Content-Type': 'application/json' }, // (A) content type
                body: JSON.stringify(userData), // (A) convert userData to JSON
            });

            if (!response.ok) throw new Error('Login failed'); // (A) if response code is not within 200s, there was an error

            const data = await response.json(); // (A) otherwise if successful, parse the body

            localStorage.setItem('token', data.token); // (A) populate local storage token with the returned token
            localStorage.setItem('userData', JSON.stringify(data.user_id)); // (A) establish user session with the user id returned

            setUser(data.user_id); // (A) set up a tracker internally 
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    /*
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
    }; For SPRINT 2*/

    const register = async (userData) => { // (A) register function
        try {
            const response = await fetch('http://127.0.0.1:5000/register', { // (A) our POST to the register endpoint on Flask
                method: 'POST', // (A) method type
                headers: { 'Content-Type': 'application/json' }, // (A) content type
                body: JSON.stringify(userData), // (A) convert our javascript obj into JSON format
            });

            if (!response.ok) throw new Error('Registration failed'); // (A) throw error whenever outside of 200 series

            const data = await response.json(); // (A) parse the json response
            console.log(data.message); // (A) log message and return true in successs
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}> {/** (A) Make the context's listed values available to children */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => { // (A) our hook to return functions
    const context = useContext(AuthContext); // (A) check for AuthContext, base case is null
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context; // (A) return all the functions/states associated with the context
};