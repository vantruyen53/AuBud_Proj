import React, { useState, useEffect } from 'react';

interface ExportExcelModalProps {
  isOpen: boolean;
  fileName:string,
  setFileName:(fileName:string)=>void,
  onClose: () => void;
  onExport: () => void;
}

const ExportExcelModal: React.FC<ExportExcelModalProps> = ({ isOpen, fileName,setFileName, onClose, onExport }) => {
  const [isHover, setIsHover] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const primaryColor = '#5bb8a8';

  // Định nghĩa Styles Object
  const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 2500,
      backdropFilter: 'blur(3px)',
      animation: 'fadeIn 0.2s ease-out',
    },
    modalContainer: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '450px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      animation: 'slideUp 0.3s ease-out',
    },
    title: {
      margin: '0 0 20px 0',
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#333',
      textAlign: 'left',
    },
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    label: {
      fontSize: '0.95rem',
      color: '#555',
      whiteSpace: 'nowrap',
    },
    inputContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      border: `1.5px solid ${isFocus ? primaryColor : '#ddd'}`,
      borderRadius: '6px',
      padding: '0 12px',
      transition: 'border-color 0.2s',
    },
    input: {
      flex: 1,
      border: 'none',
      outline: 'none',
      padding: '10px 0',
      fontSize: '0.95rem',
      color: '#333',
      width: '100%',
    },
    extension: {
      fontSize: '0.95rem',
      color: '#888',
      fontWeight: 500,
      paddingLeft: '8px',
    },
    button: {
      width: '100%',
      backgroundColor: isHover ? '#4a998b' : primaryColor,
      color: '#fff',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Export Excel file</h2>
        
        <div style={styles.inputRow}>
          <span style={styles.label}>File name</span>
          
          <div style={styles.inputContainer}>
            <input 
              value={fileName}
              onChange={(e)=>setFileName(e.target.value)}
              style={styles.input}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              placeholder="Enter file name..."
              autoFocus
            />
            <span style={styles.extension}>.xlsx</span>
          </div>
        </div>

        <button 
          style={styles.button}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={onExport}
        >
          Export Now
        </button>
      </div>
    </div>
  );
};

export default ExportExcelModal;