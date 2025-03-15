import axios from 'axios';

export async function login(dispatch, email, password) {
    try {
        const response = await axios.post('https://easy-terview.site/api/users/login', { email, password });
        const accessToken = response.headers['authorization'];
        const refreshToken = response.headers['refreshtoken'];

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch({
            type: 'SET_LOGIN_STATE',
            payload: {
                isLoggedIn: true,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        throw new Error('Failed to log in. Please try again.');
    }
}

export function logout(dispatch) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
    alert("로그인 화면으로 이동합니다.");
}
