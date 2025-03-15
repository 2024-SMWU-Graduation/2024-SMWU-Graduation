import './ParseFeedback.css'

const parseFeedback = (feedbackText) => {
  if (!feedbackText) return null;

  const GoodPoint = feedbackText.positive_feedback;
  const BadPoint = feedbackText.constructive_feedback;
  const improvedScript = feedbackText.improved_answer;

  const extractList = (text) => {
    return text
      ? text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("-"))
          .map((line, index) => <li key={index}>{line.substring(1).trim()}</li>)
      : null;
  };

  return (
    <div>
      {GoodPoint && (
        <div>
          <div className='feedback-script-title'>
            😄 잘한 점
          </div>
          {/* <ul>{extractList(GoodPoint[1])}</ul> */}
          <ul>{GoodPoint}</ul>
          <br/>
        </div>
      )}

      {BadPoint && (
        <div>
          <div className='feedback-script-title'>
            🤔 보완할 점
          </div>
          {/* <ul>{extractList(BadPoint[1])}</ul> */}
          <ul>{BadPoint}</ul>
          <br/>
        </div>
      )}

      {improvedScript && (
        <div>
          <div className='feedback-script-title'>
            📄 보완된 대본 예시
          </div>
          {/* <blockquote>{improvedScript[1]}</blockquote> */}
          <ul>{improvedScript}</ul>
        </div>
      )}
    </div>
  );
};

export default parseFeedback;