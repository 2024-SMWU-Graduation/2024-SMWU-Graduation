import '../css/IntroduceFeedback.css';
import { api } from "../axios"
import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import parseFeedback from '../utils/ParseFeedback';
import Loading from '../components/Loading';

function Feedback() {
    const location = useLocation();
    const id = location.state.id;
    const videoRef = useRef(null); //video 태그 제어
    const [apiResult, setApiResult] = useState(null);
    const [analyzeData, setAnalyzeData] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [fetching, setFetching] = useState(true);  // 백엔드 요청 여부 추적 상태

    // 백에서 영상 url, 표정분석 결과 url 받기
    useEffect(() => {
      const fetchFeedback = async () => {
        try {
          const response = await api.get(`/feedback/introduce/${id}`);
          console.log("API 응답:", response); // 전체 응답 확인
    
          if (response.data && response.data.data) {
            const feedback = {
              videoUrl: response.data.data.videoUrl,
              negativePercentage: response.data.data.negativePercentage,
              timelines: response.data.data.timelines || [],
              analyzeUrl: response.data.data.analyzeUrl,
            };
            console.log("🎯 설정된 feedback:", feedback);

            // 백엔드에서 analyzeUrl가 바뀌었으면 상태 업데이트
            if (feedback.analyzeUrl !== apiResult?.analyzeUrl) {
              setApiResult(feedback);
            }
            // analyzeUrl가 null이 아니면 요청을 멈추도록 설정
            if (feedback.analyzeUrl) {
              setFetching(false);  // analyzeUrl가 올바르게 설정되면 요청 중지
            }
          } else {
            console.error("API 응답이 예상한 형식이 아닙니다:", response.data);
          }
        } catch (error) {
          console.error("데이터를 가져오는 중 오류 발생:", error);
        }
      };
      if (fetching) {
        fetchFeedback();
      }
      // 5초마다 백엔드에 요청을 보내 analyzeUrl가 변경되었는지 체크 (polling)
      const interval = setInterval(() => {
        if (fetching) {
          fetchFeedback();
        }
      }, 5000);

      // 컴포넌트가 unmount될 때 interval을 정리
      return () => clearInterval(interval);
    }, [id, apiResult?.analyzeUrl]);


    // json 파일 데이터 저장하기
    useEffect(() => {
      // if (apiResult === null) return; // apiResult가 설정되지 않았다면 실행하지 않음
      if (!apiResult || !apiResult.analyzeUrl) return; // 🔥 apiResult가 완전히 설정된 후 실행
      console.log("🔥 useEffect 실행 - analyzeUrl:", apiResult.analyzeUrl);

      const fetchAnalyzeData = async () => {
        try {
          const response = await fetch(apiResult.analyzeUrl);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
          const jsonData = await response.json();
          console.log("✅ AI 분석 결과 데이터:", jsonData);
          setAnalyzeData(jsonData);
        } catch (error) {
          console.error("❌ AI 분석 데이터를 불러오는 중 오류 발생:", error);
        }
      };
      fetchAnalyzeData();
    }, [apiResult?.analyzeUrl]);
    

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

         // 0.5초 추가하여 재생 위치 설정
        videoRef.current.currentTime = parseFloat(time) +0.5;
        
        const onSeeked = () => {
          videoRef.current.play();
          videoRef.current.removeEventListener("seeked", onSeeked); // 이벤트 제거
        };
        
        videoRef.current.addEventListener("seeked", onSeeked);
      }
    }

    return (
      <div>
      {apiResult ? (
        <div className="content">
          <div className="videoArea">
            <video ref={videoRef} src={apiResult.videoUrl} controls preload="auto"></video>
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
                  <p>{analyzePercentage(apiResult.negativePercentage)}</p>
                  <p>부정 퍼센트: {apiResult.negativePercentage}%</p>
                  {apiResult.timelines.length > 0 ? (
                    <ul>{renderTimelines(apiResult.timelines)}</ul>
                  ) : (
                    <p>시간대 정보 없음</p>
                  )}
                </>
              )}
              {activeTab === 1 && (
                <>
                  <p className="mainFeedbackText">[AI 답변 분석 피드백 확인하기]</p>
                  {analyzeData?.original_script ? (
                    <div>
                      <div className="feedback-script-title">✏️ 원본 대본</div>
                      <p>{analyzeData.original_script}</p>
                      {/* <p>{analyzeData.improved_answer}</p> */}
                      {parseFeedback(analyzeData)}
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
      </div>
    );
};

export default Feedback;