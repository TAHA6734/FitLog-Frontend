import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const storedUser = localStorage.getItem('user');
const token = localStorage.getItem('accessToken');

if (storedUser && token) {
setUser(JSON.parse(storedUser));
}

setLoading(false);
}, []);

const login = (authResponse) => {
localStorage.setItem('accessToken', authResponse.accessToken);
localStorage.setItem('refreshToken', authResponse.refreshToken);

const userData = {
userId: authResponse.userId,
username: authResponse.username,
hasCompletedOnboarding: authResponse.hasCompletedOnboarding,
};

localStorage.setItem('user', JSON.stringify(userData));
setUser(userData);
};
const updateUser = (updates) => {
    setUser((prev)=>{
        const updated = { ...prev, ...updates };
        localStorage.setItem('user',JSON.stringify(updated));
        return updated;
    });
};
const logout = () => {
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
setUser(null);
};

return (
<AuthContext.Provider value={{ user, login, logout, loading, updateUser}}>
{children}
</AuthContext.Provider>
);
}

export function useAuth() {
return useContext(AuthContext);
}
