import React, { useState } from 'react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromDate: string; // Định dạng YYYY-MM-DD
  toDate: string;   // Định dạng YYYY-MM-DD
  onSelectFrom: (date: string) => void;
  onSelectTo: (date: string) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ 
  isOpen, onClose, fromDate, toDate, onSelectFrom, onSelectTo 
}) => {
  // Trạng thái tháng/năm đang hiển thị trên lịch
  const [viewDate, setViewDate] = useState(new Date());
  const [selectingMode, setSelectingMode] = useState<'from' | 'to'>('from');

  const primaryColor = '#5bb8a8';
  const lightColor = '#d1ece8';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!isOpen) return null;

  // Helpers xử lý ngày tháng
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

  const formatToYYYYMMDD = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = formatToYYYYMMDD(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (selected > today) return; // Chặn ngày tương lai

    if (selectingMode === 'from') {
      if (new Date(dateStr) > new Date(toDate)) {
        alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        return;
      }
      onSelectFrom(dateStr);
    } else {
      if (new Date(dateStr) < new Date(fromDate)) {
        alert("Ngày kết thúc không được nhỏ hơn ngày bắt đầu!");
        return;
      }
      onClose()
      onSelectTo(dateStr);
    }
  };

  // Render Logic
  const days = [];
  const totalDays = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  // Padding cho các ngày trống đầu tháng
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = formatToYYYYMMDD(viewDate.getFullYear(), viewDate.getMonth(), d);
    const isFuture = new Date(viewDate.getFullYear(), viewDate.getMonth(), d) > today;
    const isFrom = dateStr === fromDate;
    const isTo = dateStr === toDate;

    days.push(
      <div 
        key={d} 
        style={{
          ...styles.dayCell,
          backgroundColor: isTo ? primaryColor : (isFrom ? lightColor : 'transparent'),
          color: isTo ? '#fff' : '#333',
          cursor: isFuture ? 'not-allowed' : 'pointer',
          opacity: isFuture ? 0.4 : 1,
          border: isFrom || isTo ? `1px solid ${primaryColor}` : 'none'
        }}
        className={isFuture ? "" : "day-hover"}
        onClick={() => !isFuture && handleDateClick(d)}
      >
        {d}
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        .day-hover:hover { background-color: #f0f0f0; border-radius: 50%; }
        @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <button style={styles.navBtn} onClick={handlePrevMonth}>&lt;</button>
          <div style={styles.monthYear}>
            {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
          </div>
          <button style={styles.navBtn} onClick={handleNextMonth}>&gt;</button>
        </div>

        <div style={styles.modeToggle}>
          <button 
            style={{...styles.toggleBtn, borderBottom: selectingMode === 'from' ? `3px solid ${primaryColor}` : 'none'}}
            onClick={() => setSelectingMode('from')}
          >
            From: {fromDate}
          </button>
          <button 
            style={{...styles.toggleBtn, borderBottom: selectingMode === 'to' ? `3px solid ${primaryColor}` : 'none'}}
            onClick={() => setSelectingMode('to')}
          >
            To: {toDate}
          </button>
        </div>

        <div style={styles.calendarGrid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} style={styles.weekDay}>{d}</div>
          ))}
          {days}
        </div>

        <button style={styles.doneBtn} onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
  },
  container: {
    backgroundColor: '#fff', width: '320px', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'pop 0.2s ease-out'
  },
  header: {
    backgroundColor: '#5bb8a8', color: '#fff', padding: '15px',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap:'15px'
  },
  navBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer' },
  monthYear: { fontWeight: 'bold', fontSize: '1.1rem' },
  modeToggle: { display: 'flex', borderBottom: '1px solid #eee' },
  toggleBtn: { 
    flex: 1, padding: '12px', border: 'none', background: '#fff', 
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 
  },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px', backgroundColor: '#fff' },
  weekDay: { textAlign: 'center', color: '#999', fontSize: '0.8rem', padding: '10px 0' },
  dayCell: {
    height: '35px', width: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '2px auto', borderRadius: '50%', fontSize: '0.9rem', transition: 'all 0.2s'
  },
  doneBtn: {
    width: '100%', padding: '12px', border: 'none', backgroundColor: '#f8f8f8',
    color: '#5bb8a8', fontWeight: 'bold', cursor: 'pointer', borderTop: '1px solid #eee'
  }
};

export default CalendarModal;