import '../../css/QuestionList.css'
import React, { useState, useEffect } from 'react';
import { api } from "../../axios"
import { formatDate } from "../../utils/DateUtils";
import { useNavigate } from 'react-router-dom';

function QuestionList() {
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null); 
  const [newTitle, setNewTitle] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
          const response = await api.get('/interview/random');
          console.log("response 결과", response);
          setVideos(response.data.data.responseDtoList);
      } catch (error) {
          console.error('비디오를 가져오는 중 오류 발생:', error);
      }
    };

    fetchVideos();
  }, []);

  // 동영상 제목 수정
  const handleEditClick = (id, currentTitle) => {
    setEditingId(id);
    setNewTitle(currentTitle); // 현재 제목으로 초기화
  };

  // 동영상 제목 수정 후 백으로 보내서 저장
  const handleSaveClick = async (id) => {
    try {
        // API를 호출하여 제목 업데이트
        await api.patch('/interview/introduce/title', { interviewId: id, title: newTitle }); 

        // 상태를 업데이트하여 화면에 즉시 반영
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video.interviewId === id ? { ...video, title: newTitle } : video
          )
        );

        setEditingId(null); // 수정 상태 해제
    } catch (error) {
        console.error('제목 업데이트 중 오류 발생:', error);
    }
  };

  // 동영상 삭제하기
  const handleDeleteClick = async (id) => {
    if (!window.confirm("동영상을 삭제하시겠습니까?")) return; // 사용자 확인

    try {
        await api.delete(`/interview/random/${id}`); // DELETE 요청
        // 화면에 즉시 반영
        setVideos((prevVideos) => prevVideos.filter((video) => video.interviewId !== id));
    } catch (error) {
        console.error("비디오 삭제 중 오류 발생:", error);
    }
  };

  // 피드백 페이지로 이동
  const handleTitleClick = (id) => {
    navigate(`/question-feedback`, {
      state : { id },
    });
  };

  return (
    <div className="video-container">
        <h3 className="video-count">총 { videos ? videos.length : 0 }개의 면접 결과</h3>
        <div className="video-grid">
            {videos && videos.map((video) => (
                <div key={video.interviewId} className="video-item">
                    <video src={video.videoUrl} controls width="100%"/>
                    {editingId === video.interviewId ? (
                        <div className="title-edit-container">
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="title-input"
                            />
                            <button onClick={() => handleSaveClick(video.interviewId)} className="save-btn">
                                저장
                            </button>
                        </div>
                    ) : (
                        <div className="title-container">
                            <h3
                              className="video-title"
                              onClick={() => handleTitleClick(video.interviewId)}
                              style={{ cursor: 'pointer' }}
                            >
                              {video.title}
                            </h3>
                            <span
                              className="edit-icon"
                              onClick={() => handleEditClick(video.interviewId, video.title)}
                              style={{ cursor: 'pointer', marginLeft: '10px' }}
                            > ✏️
                            </span>
                            <span
                              className="delete-icon"
                              onClick={() => handleDeleteClick(video.interviewId)}
                              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                            > ❌
                            </span>
                        </div>
                    )}
                    <p>{formatDate(video.createdAt)}</p>
                </div>
            ))}
        </div>
    </div>
  );
  
}

export default QuestionList;