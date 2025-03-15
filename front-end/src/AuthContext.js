import React, {createContext, useReducer, useContext, useEffect} from 'react';

const AuthContext = createContext();

const initialState = {
    isLoggedIn: false,
    accessToken: null,
    refreshToken: null
};

function authReducer(state, action) {
    switch (action.type) {
        case 'SET_LOGIN_STATE':
            return {
                ...state,
                isLoggedIn: true,
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken
            };
        case 'LOGOUT':
            return {
                ...initialState
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    useEffect(() => {
        const isLoggedIn = true
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
            dispatch({
                type: 'SET_LOGIN_STATE',
                payload: { isLoggedIn, accessToken, refreshToken }
            });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
