import './ParseFeedback.css'

const parseQuestionFeedback = (feedbackText) => {
  if (!feedbackText) return null;

  const GoodPoint = feedbackText["잘한 점"];
  const BadPoint = feedbackText["보완할 점"];
  const improvedScript = feedbackText["보완된 대본 예시"];

  return (
    <div>
      {GoodPoint && (
        <div>
          <div className='feedback-script-title'>
            😄 잘한 점
          </div>
          <ul>{GoodPoint}</ul>
          <br/>
        </div>
      )}

      {BadPoint && (
        <div>
          <div className='feedback-script-title'>
            🤔 보완할 점
          </div>
          <ul>{BadPoint}</ul>
          <br/>
        </div>
      )}

      {improvedScript && (
        <div>
          <div className='feedback-script-title'>
            📄 보완된 대본 예시
          </div>
          <ul>{improvedScript}</ul>
        </div>
      )}
    </div>
  );
};

export default parseQuestionFeedback;