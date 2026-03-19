import { useEffect } from 'react';

export default function SessionManager({ setUser }) {
    useEffect(() => {
        let timer;
        const TIMEOUT_MS = 1 * 60 * 1000; // 15 minutes

        const handleInactivity = () => {
            // Sécurité immédiate : on supprime les accès locaux
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (setUser) setUser(null);

            // On déclenche le popup global au lieu de rediriger brutalement
            window.dispatchEvent(new CustomEvent('global-api-error', {
                detail: {
                    type: 'auth',
                    message: "Votre session a été fermée suite à 15 minutes d'inactivité. Pour votre sécurité, veuillez vous reconnecter."
                }
            }));
        };

        const resetTimer = () => {
            clearTimeout(timer);
            // On ne relance le chrono que si l'utilisateur est connecté
            if (localStorage.getItem('token')) {
                timer = setTimeout(handleInactivity, TIMEOUT_MS);
            }
        };

        const events = ['mousemove', 'keydown', 'scroll', 'click'];

        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            clearTimeout(timer);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [setUser]);

    return null;
}