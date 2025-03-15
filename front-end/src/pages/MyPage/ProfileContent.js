import '../../css/ProfileContent.css';
import { api } from "../../axios"
import {useEffect, useState} from "react";
import { formatDate } from "../../utils/DateUtils";
import kakaoLogo from "../../assets/images/kakaoLogo.png"
import naverLogo from "../../assets/images/naverLogo.png"
import noonsong from "../../assets/images/noonsong.jpg"

const ProfileContent = () => {
    const [user, setUser] = useState();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/profile');
                setUser(response.data.data);
            } catch (error) {
                console.error('회원 정보를 가져오는 중 오류 발생:', error);
            }
        };

        fetchUser();
    }, []);
    const getLoginLogo = (loginType) => {
        switch(loginType) {
            case 'KAKAO':
                return <img src={kakaoLogo} alt="Kakao" className="login-logo" />;
            case 'NAVER':
                return <img src={naverLogo} alt="Naver" className="login-logo" />;
            default:
                return null;
        }
    };

    const handleEdit = () => {
        // 회원 정보 수정 로직
        console.log("회원 정보 수정");
    };

    const handleDelete = () => {
        // 회원 탈퇴 로직
        console.log("회원 탈퇴");
    };

    return (
        <div className="user-profile">
            <div className="profile-left">
                <img src={noonsong} alt="Profile" className="profile-image"/>
            </div>
            <div className="profile-right">
                <div className="profile-info">
                    <div className="name-area">
                        <h2>{user?.name}</h2>
                        <div className="oauth-image">
                            {getLoginLogo(user?.oauthProvider)}
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-label">이메일</span>
                        <span className="info-value">{user?.email}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">가입일</span>
                        <span className="info-value">{formatDate(user?.createdAt)}</span>
                    </div>
                </div>
                <div className="profile-actions">
                    <button onClick={handleEdit} className="edit-button">비밀번호 수정</button>
                    <span onClick={handleDelete} className="delete-text">회원 탈퇴</span>
                </div>
            </div>
        </div>
    )
}

export default ProfileContent;