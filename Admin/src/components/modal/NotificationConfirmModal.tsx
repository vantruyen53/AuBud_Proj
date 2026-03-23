import React from 'react';
import '../../assets/styles/NotificationConfirmModal.css';
import { HiOutlinePaperAirplane, HiOutlineCheckCircle } from 'react-icons/hi';

interface NotificationConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  recipientCount: string;
  selectedChannels: string;
  messageTitle: string;
}

const NotificationConfirmModal: React.FC<NotificationConfirmModalProps> = ({
  onConfirm,
  onCancel,
  recipientCount,
  selectedChannels,
  messageTitle
}) => {
  return (
    <div className="notif-modal-overlay">
      <div className="notif-modal">
        <div className="notif-modal__hero">
          <div className="notif-modal__icon-circle">
            <HiOutlinePaperAirplane className="notif-modal__plane-icon" />
          </div>
        </div>
        
        <div className="notif-modal__body">
          <h2 className="notif-modal__title">Confirm Broadcast</h2>
          <p className="notif-modal__desc">
            Please review the notification details before sending. This action cannot be undone.
          </p>

          <div className="notif-modal__summary">
            <div className="notif-modal__summary-row">
              <span className="notif-modal__summary-label">
                <i className="notif-modal__summary-icon">👥</i> Recipient Count
              </span>
              <span className="notif-modal__summary-value">{recipientCount} users</span>
            </div>
            
            <div className="notif-modal__summary-row">
              <span className="notif-modal__summary-label">
                <i className="notif-modal__summary-icon">📡</i> Selected Channels
              </span>
              <span className="notif-modal__summary-value">{selectedChannels}</span>
            </div>

            <div className="notif-modal__summary-row">
              <span className="notif-modal__summary-label">
                <i className="notif-modal__summary-icon">✉️</i> Message Title
              </span>
              <span className="notif-modal__summary-value truncate" title={messageTitle}>
                {messageTitle}
              </span>
            </div>
          </div>

          <div className="notif-modal__actions">
            <button className="notif-btn notif-btn--cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="notif-btn notif-btn--confirm" onClick={onConfirm}>
              <HiOutlineCheckCircle /> Confirm & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationConfirmModal;
