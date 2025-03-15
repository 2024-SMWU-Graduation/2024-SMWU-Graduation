import '../../css/MyPage.css';
import {useEffect, useState} from "react";
import IntroduceList from "./IntroduceList";
import ProfileContent from "./ProfileContent";
import QuestionList from './QuestionList';

const MyPage = () => {
    const [selectedMenu, setSelectedMenu] = useState(() => {
      return localStorage.getItem('selectedMenu') || 'profile';
    });

    useEffect(() => {
      localStorage.setItem('selectedMenu', selectedMenu);
    }, [selectedMenu]);

    return (
        <div className="my-page">
            <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu}/>
            <div className="content">
                <Content selectedMenu={selectedMenu}/>
            </div>
        </div>
    );
};

const Sidebar = ({selectedMenu, onMenuSelect}) => {
    const menuItems = [
        {id: 'profile', label: '회원 정보' },
        { id: 'introduce-feedback', label: '자기소개 면접 조회' },
        { id: 'job-feedback', label: '직무별 면접 조회' },
        // 추가 메뉴 항목들...
    ];

    return (
        <nav className="sidebar">
            {menuItems.map(item => (
                <button
                    key={item.id}
                    className={`menu-item ${selectedMenu === item.id ? 'active' : ''}`}
                    onClick={() => onMenuSelect(item.id)}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );
};

const Content = ({ selectedMenu }) => {
    switch (selectedMenu) {
        case 'profile':
          return <ProfileContent />;
        case 'introduce-feedback':
          return <IntroduceList />;
        case 'job-feedback' :
          return <QuestionList />;
        default:
            return <div>선택된 메뉴가 없습니다.</div>;
    }
};

export default MyPage;
