import React, { useEffect } from 'react';
import {HiCheckCircle , HiXCircle   } from 'react-icons/hi';
import '../../assets/styles/SuccessModal.css'
import { Color } from '../../constants/theme';

interface SuccessModalProps {
  result: {isOpen:boolean, status:boolean, message:string};
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  result, 
  onClose,
}) => {
  
  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    if (result.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [result.isOpen]);

  if (!result.isOpen) return null;

  return (
    <div className='success-modal__overlay' onClick={onClose}>
      <div className='success-modal__modalContent' onClick={(e) => e.stopPropagation()}>
        <div className='success-modal__iconWrapper'>
          <div className="success-modal__circle-ex" style={{backgroundColor:`${result.status?Color.success:Color.error}20`}}>
            <div className="success-modal__circle-in" style={{backgroundColor:`${result.status?Color.success:Color.error}40`}}>
              {result.status?
                <HiCheckCircle size='80px'color={Color.success}/>:
                <HiXCircle size='80px'color={Color.error}/>
              }
            </div>
          </div>
        </div>
        
        <h2 className='success-modal__title'>{result.status?"Successfully":"Failure"}</h2>
        <p className='success-modal__message'>{result.message}</p>
        
        <button className='success-modal__closeButton' onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;