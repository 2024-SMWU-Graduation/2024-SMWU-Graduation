import '../css/Question.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"; 
import { api } from "../axios";
// import {formatPercentage} from "../utils/FormatUtils";
import Loading from '../components/Loading';

import QuestionData from "../assets/data/QuestionData.js";
import CategoryData from "../assets/data/CategoryData.js";

function Question() {
  const navigate = useNavigate();
  const [videoBlob, setVideoBlob] = useState(null); //녹화된 영상 Blob 상태
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null); //영상 URL 상태
  const [isRecording, setIsRecording] = useState(false); //녹화 상태
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 분석요청 팝업 상태
  const [loadingPopup, setLoadingPopup] = useState(false); // 로딩 팝업 상태

  const [selectedCategory, setSelectedCategory] = useState(null); // 선택된 버튼 상태
  const [selectedText, setSelectedText] = useState(""); // 랜덤 질문 상태 관리
  const [isRecordingText, setIsRecordingText] = useState("") // 녹화중 알림 텍스트 
  const [randomInterviewId, setRandomInterviewId] = useState("") // 인터뷰 아이디값
  const [randomQuestionId, setRandomQuestionId] = useState("") // 퀘스천 아이디값
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]); //녹화된 영상 데이터

  const handleCategorySelect = (category) => {
    setSelectedCategory(category); // 선택한 카테고리 업데이트
    const questions = QuestionData[category]; // 해당 카테고리의 질문 가져오기
    if (questions && questions.length > 0) {
      const randomText = questions[Math.floor(Math.random() * questions.length)];
      setSelectedText(randomText);
    } else {
      setSelectedText("해당 카테고리에 질문이 없습니다.");
    }

    // 3초 후 녹화 시작
    setTimeout(() => {
      startRecording();
    }, 3000);
  }

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

    // 백으로 디비 생성 요청, 인터뷰 아이디 받아오기
    const startRequest = await api.post("/interview/random", {
    });
    const randomInterviewId = startRequest.data.data.randomInterviewId;
    setRandomInterviewId(randomInterviewId);

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
        questionData: selectedText,
      });
      formData.append("requestDto", new Blob([jsonData], { type: "application/json" }));
      
      // S3 업로드 API 호출
      const s3Response = await api.post("/interview/random/question", formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });
      
      
      // AI 보낼 데이터
      const videoFormData = new FormData();
      videoFormData.append("file", videoBlob, "recorded-video.mp4");

      // AI 분석 API 호출
      const aiResponse = await axios.post("https://easy-terview.site/upload", videoFormData);

      // AI 분석 결과 처리
      const aiResult = aiResponse.data.result;

      // question id 받아오기
      const randomQuestionId = s3Response.data.data.questionId;
      setRandomQuestionId(randomQuestionId);
      
      const modifiedData = {
        questionId: randomQuestionId,
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
      
      // 추가질문 페이지로 이동
      navigate('/question-second', {
        state: {
          id: `${randomInterviewId}`,
        },
      });
    } catch (error) {
      console.error("에러 발생:", error);
      alert("요청에 실패했습니다.");
    };
  };

  // 스크롤 이동
  const element = useRef();
  const onMoveToElement = () => {
    element.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <div className='question-wrapper'>
        <h2 className='intro'>
          아래 직무별 버튼 중 한가지를 클릭하여 질문을 확인하세요.
        </h2>
        <div className='question-warning-text'>
          질문이 제시되면 3초 후 녹화가 시작됩니다. 답변을 준비해주세요.
          <br/>
          얼굴이 화면 중앙에 올 수 있도록 조정해주세요.
        </div>
        <br/>
        <div className='category-buttons'>
          {!selectedCategory && CategoryData.map((category, index) => (
            <button
              key={index}
              className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
              onClick={() => { handleCategorySelect(category); onMoveToElement(); }}
            >
              {category}
            </button>
          ))}
        </div>
        <h2 className="selected-text">
          {selectedText}
        </h2>
        <div className='record-warning'>
          {isRecordingText}
        </div>
        <br/>
        <div style={{ position: "relative", width: "640px", height: "480px", }} ref={element}>
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

export default Question;