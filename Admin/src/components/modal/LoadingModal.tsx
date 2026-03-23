import React from 'react';
import '../../assets/styles/LoadingModal.css';

interface LoadingProps {
  isOpen: boolean;
}

const LoadingModal: React.FC<LoadingProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className='loading-modal__overlay'>
      <div className='loading-modal__spinner'></div>
      <p className='loading-modal__text'>Đang xử lý, vui lòng đợi...</p>
    </div>
  );
};

export default LoadingModal;