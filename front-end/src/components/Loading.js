import React from 'react';
// import {Background, LoadingText} from './LoadingStyle';
import Spinner from '../assets/images/Spinner.gif';

const Loading = () => {
  return (
    <div>
      <img src={Spinner} alt='로딩' width="15%" />
    </div>
  );
};

export default Loading;
