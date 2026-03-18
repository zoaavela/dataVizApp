import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SessionManager({ setUser }) {
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        const TIMEOUT_MS = 15 * 60 * 1000;

        const logout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
        };

        const resetTimer = () => {
            clearTimeout(timer);
            if (localStorage.getItem('token')) {
                timer = setTimeout(logout, TIMEOUT_MS);
            }
        };

        const events = ['mousemove', 'keydown', 'scroll', 'click'];

        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            clearTimeout(timer);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [navigate, setUser]);

    return null;
}