import React, {useEffect, useState} from "react";
import {Link, useNavigate} from 'react-router-dom';
import axios from "axios";
import './LogIn.css';
import {useAuth} from "../AuthContext";
import {login} from "../authActions";

//import { useForm,Controller } from "react-hook-form";

const User = {
  email : " " ,
  password : " ",
  name : " "
}

function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const url = 'http://localhost:8080/api/users/login'
      await login(dispatch, email, password)
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  }

  return (
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">로그인</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">이메일</label>
              <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>
            <button type="submit" className="login-button">로그인</button>
          </form>

          <div className="social-login">
            <button className="kakao-login">카카오 로그인</button>
            <button className="naver-login">네이버 로그인</button>
          </div>

          <div className="register-link">
            계정이 없으신가요? <Link to="/register">가입하기</Link>
          </div>
        </div>
      </div>
  );
}

export default LogIn;