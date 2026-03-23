import React from 'react';
import { 
  HiOutlineChevronRight, 
  HiDotsVertical 
} from 'react-icons/hi';
import '../assets/styles/feedback.css';

import { createIconAcc } from '../utils/helpers/IconText';

import type{ FeedbackEntity } from '../model/type/feedback.type';

// export interface FeedbackData {
//   id: string;
//   user: {
//     avatar: string;
//     name: string;
//     email: string;
//     idTag: string;
//   };
//   submittedDate: {
//     date: string;
//     time: string;
//   };
//   rating: number;
//   message: string;
//   status: 'Unread' | 'Read' | 'Resolved';
// }

interface FeedbackOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  data: FeedbackEntity | null;
}

const FeedbackOffcanvas: React.FC<FeedbackOffcanvasProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="offcanvas-backdrop" onClick={onClose} />

      {/* Slide-out Panel */}
      <div className={`offcanvas-panel ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="offcanvas-header">
          <button className="btn-icon-subtle" onClick={onClose}>
            <HiOutlineChevronRight />
          </button>
          <h2 className="offcanvas-title">Feedback Details</h2>
          <button className="btn-icon-subtle">
            <HiDotsVertical />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="offcanvas-body">
          
          {/* User Profile */}
          <div className="offcanvas-profile">
            <div className="sidebar__user-avatar"><span>{createIconAcc(data.userName)}</span></div>
            <div className="offcanvas-profile-info">
              <h3 className="offcanvas-name">{data.userName}</h3>
              <span className="offcanvas-email">{data.email}</span>
              <span className="offcanvas-id">ID: #{data.userId}</span>
            </div>
          </div>

          {/* Metadata Cards Grid */}
          <div className="offcanvas-meta-grid">
            <div className="meta-card">
              <span className="meta-card__label">SUBMITTED</span>
              <span className="meta-card__value">{data.createdAt}</span>
            </div>
            
            <div className="meta-card">
              <span className="meta-card__label">RATING</span>
              <div className="meta-card__rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`nav-star ${star <= parseInt(data.rating) ? 'filled' : 'empty'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="rating-number">{parseInt(data.rating).toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Feedback Body Box */}
          <div className="offcanvas-section">
            <label className="section-label">CUSTOMER FEEDBACK</label>
            <div className="feedback-quote-box">
              "{data.content}"
            </div>
          </div>

          {/* Change Status Dropdown */}
          <div className="offcanvas-section">
            <label className="section-label">CHANGE STATUS</label>
            {/* <select className="status-select" defaultValue={data.status}>
              <option value="Unread">&bull; Mark as Unread</option>
              <option value="Read">&bull; Mark as Read</option>
              <option value="Resolved">&bull; Resolve Issue</option>
            </select> */}
          </div>

        </div>
      </div>
    </>
  );
};

export default FeedbackOffcanvas;
