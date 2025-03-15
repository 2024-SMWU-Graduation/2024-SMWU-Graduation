export function formatDate(localDateTime) {
    const date = new Date(localDateTime); // LocalDateTime 문자열을 Date 객체로 변환
    date.setHours(date.getHours() + 9); // 한국시간으로 변환

    const year = date.getFullYear(); // 연도
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1)
    const day = String(date.getDate()).padStart(2, '0'); // 일

    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}