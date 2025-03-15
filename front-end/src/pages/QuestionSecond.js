import '../css/QuestionSecond.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios"; 
import { api } from "../axios";
// import {formatPercentage} from "../utils/FormatUtils";
import Loading from '../components/Loading';

function QuestionSecond() {
  const navigate = useNavigate();
  const [videoBlob, setVideoBlob] = useState(null); //녹화된 영상 Blob 상태
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null); //영상 URL 상태
  const [isRecording, setIsRecording] = useState(false); //녹화 상태
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 분석요청 팝업 상태
  const [loadingPopup, setLoadingPopup] = useState(false); // 로딩 팝업 상태

  // const [selectedText, setSelectedText] = useState(""); // 랜덤 질문 상태 관리
  const [isRecordingText, setIsRecordingText] = useState("") // 녹화중 알림 텍스트 
  const [randomInterviewId, setRandomInterviewId] = useState("") // 아이디값
  const [tailQuestion, setTailQuestion] = useState("") // 추가 질문
  const [secondRandomQuestionId, setSecondRandomQuestionId] = useState("") // 두번째 영상의 퀘스천 아이디값

  const location = useLocation();
  const firstInterviewId = location.state.id; // 첫번째 동영상 아이디값
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]); //녹화된 영상 데이터

  // 추가질문 받아오기 +퀘스천아이디 받아오기
  useEffect(() => {
    const getTailQuestion = async () => {
      try {
          const tail = await api.get(`/interview/random/${firstInterviewId}/question/tail`);
          console.log(tail.data.data);
          
          if (tail.data.data.success) {
            setTailQuestion(tail.data.data.questionData);

            const secondQuestionId = tail.data.data.questionId;
            setSecondRandomQuestionId(secondQuestionId);

            setTimeout(() => {
              startRecording();
            }, 3000);
          } else {
            setTimeout(getTailQuestion, 5000); // 5초 후 다시 요청
          }
          console.log(tailQuestion);
      } catch (error) {
          console.error('꼬리질문 가져오는 중 오류 발생:', error);
      }
    };

    getTailQuestion();
  }, []);

  //사용자 웹캠에 접근
  const getUserCamera = () =>{
    navigator.mediaDevices
      .getUserMedia({video: true})
      .then((stream) => {
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 화면 키면 바로 웹캠 띄우기
  useEffect(() => {
    getUserCamera();
  },[]);

  // 녹화 시작 함수
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true, // 녹화 시에만 오디오 추가
    });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/mp4" });

    recordedChunks.current = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(recordedChunks.current, { type: "video/mp4" });
      setVideoBlob(videoBlob); //녹화된 영상 Blob 저장
      const url = URL.createObjectURL(videoBlob);
      setMediaBlobUrl(url);
      setIsPopupOpen(true); // 팝업 상태 활성화
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setIsRecordingText("녹화중");
  };

  // 녹화 중지 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsRecordingText("녹화 종료")
  };

  // 분석 요청
  const handleSubmit = async () => {
    if (!videoBlob) {
      return alert("녹화된 영상이 없습니다.");
    };

    try {
      // 백-S3 보낼 데이터
      const formData = new FormData();
      formData.append("file", videoBlob, "recorded-video.mp4");
      
      // JSON 데이터를 문자열로 변환해서 추가
      const jsonData = JSON.stringify({
        interviewId: randomInterviewId,
        // questionData: selectedText, 
      });
      formData.append("requestDto", new Blob([jsonData], { type: "application/json" }));
      
      // S3 업로드 API 호출
      const s3Response = await api.post(`/interview/random/question/${secondRandomQuestionId}`, formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });
      
      
      // AI 보낼 데이터
      const videoFormData = new FormData();
      videoFormData.append("file", videoBlob, "recorded-video.mp4");

      // AI 분석 API 호출
      const aiResponse = await axios.post("https://easy-terview.site/upload", videoFormData,);

      // AI 분석 결과 처리
      const aiResult = aiResponse.data.result;

      const modifiedData = {
        questionId: secondRandomQuestionId,
        negativePercentage: aiResult.negative_ratio, // 부정 비율 (예: 23.5)
        timelines: aiResult.negative_intervals.map(interval => ({
          startTime: interval.start,
          endTime: interval.end,
          intensity: interval.intensity,
        })), // 구간별 상세 정보
      };

      // 피드백 API
      await api.post("/feedback/random/question", modifiedData, {
        headers: { "Content-Type": "application/json" }
      });

      // 녹화 완료 페이지 이동
      navigate('/interview-end');
    } catch (error) {
      console.error("에러 발생:", error);
      alert("요청에 실패했습니다.");
    };
  };

  return (
    <div>
      <div className='question-wrapper'>
        <h2 className='intro'>
          {tailQuestion ? (
            tailQuestion
          ) : (
            <div className='intro'>
              <p>추가질문 생성중..</p>
              <Loading/>
            </div>
          )}
        <br/>
        <br/>
        <div className='question-warning-text'>
          질문이 제시되면 3초 후 녹화가 시작됩니다. 답변을 준비해주세요.
          <br/>
          얼굴이 화면 중앙에 올 수 있도록 조정해주세요.
        </div>
        <br/>
        </h2>
        <div className='record-warning'>
          {isRecordingText}
        </div>
        <br/>
        <div style={{ position: "relative", width: "640px", height: "480px", }}>
          <video ref={videoRef} />
          <div
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "50%", height: "50%",
              transform: "translate(-50%, -50%)",
              border: "2px dashed #ffffff",
            }}
          ></div>
        </div>

        <div className='video'>
          <button className="start-stop-Btn" onClick={startRecording} disabled={isRecording}>
            녹화 시작
          </button>
          <button className="start-stop-Btn" onClick={stopRecording} disabled={!isRecording}>
            녹화 종료
          </button>
          <br />
        </div>
      </div>
      {/* 분석요청팝업 */}
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3 className='intro'>녹화가 완료되었습니다. <br/> 분석을 요청하시겠습니까?</h3>
            <video src={mediaBlobUrl} controls style={{ width: "100%" }}></video>
            <button className="submit-button"  // 분석 요청 버튼 클릭시 1.분석함수 2.요청팝업닫기 3.로딩팝업띄우기
            onClick={() => { handleSubmit(); setIsPopupOpen(false); setLoadingPopup(true);}}>분석 요청</button>
            <button className="submit-button" onClick={() => setIsPopupOpen(false)}>취소</button>
          </div>
        </div>
      )}
      {/* 로딩팝업 */}
      {loadingPopup && (
        <div className='popup'>
          <div className='popup-content'>
            <h3 className='intro'>잠시만 기다려주세요..</h3>
            <Loading/>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionSecond;