import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HomePage.css';

// 이미지 import (예시 경로입니다. 실제 이미지 경로로 수정해주세요.)
import aiAnalysisImage from '../../src/assets/images/analyze_face.png';
import customQuestionsImage0 from '../../src/assets/images/question1.png';
import customQuestionsImage1 from '../../src/assets/images/question2.png';
import customQuestionsImage2 from '../../src/assets/images/question3.png';
import realtimeFeedbackImage from '../../src/assets/images/feedback.png';

function HomePage() {
  const navigate = useNavigate();
  const getStart = async() => {
    const accessToken = localStorage.getItem('accessToken');
    if(accessToken) {
      navigate("/introduce");
    }
    else {
      navigate("/login");
    }
  }
  return (
    <div className='home-background'>
      <div className='main-container'>
        <main className='main'>
          <h2 className='headline'>
            AI 면접에 지친 당신을 위한 <span className='highlight'>이지터뷰</span>
          </h2>
          <p className='subheadline'>
            기업들의 AI 면접 완벽 대비를 위한 자기 소개 및 직무별 질문 연습 서비스
            <br />
            표정과 답변 내용까지 AI가 분석하여 맞춤형 피드백을 제공합니다.
          </p>
          <button className='cta-button' onClick={getStart}>시작하기</button>
        </main>

        {/* 서비스 특징 섹션 */}
        <section className='features-section'>
          <h3>서비스 기능</h3>
          <div className='features-container'>
            <div className='feature'>
              <h4>AI 기반 분석</h4>
              <p>면접자의 표정, 음성, 답변을 AI가 종합적으로 분석하여 피드백 제공</p>
              <img src={aiAnalysisImage} alt='AI 기반 분석' className='feature-image' />
            </div>
            <div className='feature'>
              <h4>직무별 맞춤 질문</h4>
              <p>희망 직군에 맞춰 최적화된 AI 면접 질문 제공</p>
              <img src={customQuestionsImage0} alt='직무별 맞춤 질문1' className='feature-image' />
              <img src={customQuestionsImage1} alt='직무별 맞춤 질문2' className='feature-image' />
              <img src={customQuestionsImage2} alt='직무별 맞춤 질문3' className='feature-image' />
            </div>
            <div className='feature'>
              <h4>실시간 피드백</h4>
              <p>즉각적인 피드백으로 면접 스킬을 빠르게 향상</p>
              <img src={realtimeFeedbackImage} alt='실시간 피드백' className='feature-image' />
            </div>
          </div>
        </section>

        {/* FAQ 섹션 */}
        <section className='faq-section'>
          <h3>자주 묻는 질문 FAQ</h3>
          <div className='faq-item'>
            <h4>Q: 서비스 이용은 무료인가요?</h4>
            <p>A: 기본적인 면접 연습 기능은 무료로 제공됩니다.</p>
          </div>
          <div className='faq-item'>
            <h4>Q: AI 피드백은 어떻게 제공되나요?</h4>
            <p>A: 답변 내용과 표정을 분석하여 구체적인 개선점을 제공합니다.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
