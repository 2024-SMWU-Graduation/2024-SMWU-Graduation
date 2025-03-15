import {AuthProvider} from "./AuthContext";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './Main.css'
import NavigateBar from './components/Nav';

import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage/MyPage';
import LogIn from './pages/LogIn';
import Register from './pages/Register';
import Introduce from './pages/Introduce';
import InterviewEnd from './components/InterviewEnd';
import IntroduceFeedback from './pages/IntroduceFeedback';
import Question from './pages/Question.js';
import QuestionSecond from './pages/QuestionSecond';
import QuestionFeedback from './pages/QuestionFeedback';
import QuestionFeedbackSecond from "./pages/QuestionFeedbackSecond.js";

// import {useEffect} from "react";
// import {setAxiosInterceptors} from "./axios";
// import {logout} from "./authorize/authActions";
import AuthSuccess from "./authorize/AuthSuccess";

function Main() {
  return (
      <AuthProvider>
      <BrowserRouter>
          <div className='wrapper'>
            <div className='contentWrapper'>
              <NavigateBar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="mypage" element={<MyPage />} />
                <Route path="login" element={<LogIn />} />
                <Route path="social-success" element={<AuthSuccess />} />
                <Route path="register" element={<Register />} />
                <Route path="introduce" element={<Introduce />} />
                <Route path="interview-end" element={<InterviewEnd />} />
                <Route path="introduce-feedback" element={<IntroduceFeedback />} />
                <Route path="question" element={<Question />} />
                <Route path="question-second" element={<QuestionSecond />} />
                <Route path="question-feedback" element={<QuestionFeedback />} />
                <Route path="question-feedback-second" element={<QuestionFeedbackSecond />} />
              </Routes>
            </div>
          </div>
      </BrowserRouter>
      </AuthProvider>
  );
}


export default Main;
