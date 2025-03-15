import '../css/QuestionFeedback.css'
import { api } from "../axios"
import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import parseQuestionFeedback from '../utils/ParseQuestionFeedback';
import Loading from '../components/Loading';

function QuestionFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state.id;
  const videoRef = useRef(null); //video 태그 제어
  const [analyzeData, setAnalyzeData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [fetching, setFetching] = useState(true);  // 백엔드 요청 여부 추적 상태

  // 첫번째 영상
  const [videoFirst, setVideoFirst] = useState(null);
  const [FirstAnalyzeUrl, setFirstAnalyzeUrl] = useState(null);
  const [FirstVideoUrl, setFirstVideoUrl] = useState(null);
  const [FirstNegativePercentage, setFirstNegativePercentage] = useState(null);
  const [FirstTimelines, setFirstTimelines] = useState([]);

  // 백에서 영상 url, 표정분석 결과 url 받기
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.get(`/feedback/random`, {params: {interviewId: id}} );
        console.log("API 응답:", response); // 전체 응답 확인
  
        if (response.data && response.data.data) {
          const feedbackList = response.data.data.feedbackList;
          const firstFeedback = feedbackList[0];  // 첫 번째 피드백

          // 첫번째 피드백 
          setVideoFirst(firstFeedback);
          setFirstAnalyzeUrl(firstFeedback.analyzeUrl);
          setFirstVideoUrl(firstFeedback.videoUrl);
          setFirstNegativePercentage(firstFeedback.negativePercentage);
          setFirstTimelines(firstFeedback.timelines || []);

          // analyzeUrl가 null이 아니면 요청을 멈추도록 설정
          if (FirstAnalyzeUrl) {
            setFetching(false);  // analyzeUrl가 올바르게 설정되면 요청 중지
          }
        } else {
          console.error("API 응답이 예상한 형식이 아닙니다:", response.data);
        }
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      }
    };
    
    fetchFeedback();
    
    // 5초마다 백엔드에 요청을 보내 analyzeUrl가 변경되었는지 체크 (polling)
    const interval = setInterval(() => {
      if (fetching) {
        fetchFeedback();
      }
    }, 5000);

    // 컴포넌트가 unmount될 때 interval을 정리
    return () => clearInterval(interval);
  }, [fetching, id]);

  useEffect(() => {
    if (FirstAnalyzeUrl) {
      setFetching(false);
    }
  }, [FirstAnalyzeUrl]);

  // json 파일 데이터 저장하기
  useEffect(() => {
    // if (!apiResult || !apiResult.analyzeUrl) return; // 🔥 apiResult가 완전히 설정된 후 실행
    // console.log("🔥 useEffect 실행 - analyzeUrl:", apiResult.analyzeUrl);

    const fetchAnalyzeData = async () => {
      try {
        const response = await fetch(FirstAnalyzeUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
        const jsonData = await response.json();
        console.log("✅ AI 분석 결과 데이터:", jsonData);
        setAnalyzeData(jsonData);
      } catch (error) {
        console.error("❌ AI 분석 데이터를 불러오는 중 오류 발생:", error);
      }
    };
    fetchAnalyzeData();
  }, [FirstAnalyzeUrl]);
  

  // 부정-긍정 판단
  const analyzePercentage = (percentage) => {
      if (percentage >= 40) {
          return "부정적인 표정을 많이 지으셨네요 😥"
      } else {
          return "인터뷰 내내 긍정적인 미소를 유지했어요 🙂"
      }
  };

  // 타임라인 렌더링
  const renderTimelines = (timelines) => {
    return timelines.map((timeline, index) => {
      const { startTime, endTime, intensity } = timeline;

      // 시작 시간 초단위 변환
      const [startMinutes, startSeconds] = startTime.split(":").map(Number);
      const start = startMinutes * 60 + startSeconds;

      return (
        <li key={index}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleTimestampClick(start);
            }}
          >
            {startTime} - {endTime} ({intensity})
          </a>
        </li>
      );
    });
  };

  // 타임스탬프 클릭
  const handleTimestampClick = (time) => {
    if (isNaN(time) || time === null || time === undefined) {
      console.error("Invalid timestamp:", time);
      return;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = parseFloat(time); //동영샹 재생 시간 설정 (숫자로 변환)
      
      const onSeeked = () => {
        videoRef.current.play();
        videoRef.current.removeEventListener("seeked", onSeeked); // 이벤트 제거
      };
      
      videoRef.current.addEventListener("seeked", onSeeked);
    }
  };

  // 두번째 영상 피드백 페이지로 이동
  const goToSecondVideo = (id) => {
    navigate(`/question-feedback-second`, {
      state : { id },
    });
  };

  return (
    <div>
      {videoFirst ? (
        <div className="content">
          <div className="videoArea">
            <video ref={videoRef} src={FirstVideoUrl} controls preload="auto"></video>
          </div>
          <div className="feedbackArea">
            <div className='tabs'>
              <button className={activeTab === 0 ? "active" : ""} onClick={() => setActiveTab(0)}>표정 분석</button>
              <button className={activeTab === 1 ? "active" : ""} onClick={() => setActiveTab(1)}>AI 답변 분석</button>
            </div>
            <h3>인터뷰 분석 완료!</h3>
            <div className="tabContent">
              {activeTab === 0 && (
                <>
                  <p className="mainFeedbackText">[부정 표정 확인하기]</p>
                  <p>{analyzePercentage(FirstNegativePercentage)}</p>
                  <p>부정 퍼센트: {FirstNegativePercentage}%</p>
                  {FirstTimelines.length > 0 ? (
                    <ul>{renderTimelines(FirstTimelines)}</ul>
                  ) : (
                    <p>시간대 정보 없음</p>
                  )}
                </>
              )}
              {activeTab === 1 && (
                <>
                  <p className="mainFeedbackText">[AI 답변 분석 피드백 확인하기]</p>
                  {analyzeData?.answer ? (
                    <div>
                      <div className="feedback-script-title">✏️ 질문</div>
                      <p>{analyzeData.question}</p>
                      <div className="feedback-script-title">✏️ 답변</div>
                      <p>{analyzeData.answer}</p>
                      {parseQuestionFeedback(analyzeData)}
                    </div>
                  ) : (
                    <div>
                      <p>데이터를 불러오는 중입니다...</p>
                      <Loading/>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}

      <div className="next-video-container">
        <button className="next-video-btn" onClick={() => goToSecondVideo(id)}>두번째 영상으로 이동 →</button>
      </div>
    </div>
  );
};

export default QuestionFeedback;