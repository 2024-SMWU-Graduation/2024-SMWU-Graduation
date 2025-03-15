import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        console.log(accessToken);
        console.log(refreshToken);

        if (accessToken && refreshToken) {
            // localStorage에 토큰 저장
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // 메인 페이지로 리다이렉트
            navigate('/');
        } else {
            // 토큰이 없는 경우 에러 처리
            console.error('Login failed: No tokens received');
            navigate('/login');
        }
    }, [navigate, location]);

    return <div>Processing login...</div>;
}

export default AuthSuccess;