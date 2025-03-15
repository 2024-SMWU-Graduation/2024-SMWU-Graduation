import {Link, useNavigate} from 'react-router-dom';
import './Nav.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import "bootstrap/dist/css/bootstrap.min.css";
import {useAuth} from "../AuthContext";
import {logout} from "../authorize/authActions";

function NavigateBar() {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout(dispatch);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  }

  const handleIntroduce = async() => {
    const accessToken = localStorage.getItem('accessToken');
    if(accessToken) {
      navigate("/introduce");
    }
    else {
      navigate("/login");
    }
  }

  const handleQuestion = async() => {
    const accessToken = localStorage.getItem('accessToken');
    if(accessToken) {
      navigate("/question");
    }
    else {
      navigate("/login");
    }
  }

  console.log(state.isLoggedIn)
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">이지터뷰</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={handleIntroduce}>1분 자기소개</Nav.Link>
            <Nav.Link onClick={handleQuestion}>직무별 질문</Nav.Link>
            {state.isLoggedIn ? (
                <>
                  <Nav.Link href="/mypage">마이페이지</Nav.Link>
                  <Nav.Link onClick={ handleLogout }>로그아웃</Nav.Link>
                </>
            ) : (
              <Nav.Link href="/login">로그인</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigateBar;

