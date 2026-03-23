import React from 'react';
import { HiOutlineX, HiOutlineDocumentDuplicate, HiOutlineUser } from 'react-icons/hi';
import '../../assets/styles/logDetailsOffcanvas.css';
import {type LogEntryDetailed } from '../../model/type/log.type';

interface LogDetailsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  data: LogEntryDetailed | null;
}

const LogDetailsOffcanvas: React.FC<LogDetailsOffcanvasProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handleCopy = () => {
    if (data.metaData) {
      navigator.clipboard.writeText(JSON.stringify(data.metaData, null, 2));
    }
  };

  const getStatusBadgeClass = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ERROR': return 'log-badge--error';
      case 'WARNING': return 'log-badge--warning';
      case 'INFO': return 'log-badge--info';
      case 'AI': return 'log-badge--ai';
      case 'AUTH': return 'log-badge--auth';
      default: return 'log-badge--info';
    }
  };

  return (
    <>
      <div className="log-offcanvas-backdrop" onClick={onClose} />
      <div className={`log-offcanvas-panel ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="log-offcanvas-header">
          <div className="log-offcanvas-title-group">
            <h2 className="log-offcanvas-title">Log Details</h2>
            <span className="log-offcanvas-subtitle">ID: {data.id}</span>
          </div>
          <button className="log-btn-icon" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        {/* Body */}
        <div className="log-offcanvas-body">
          <div className="log-offcanvas-top">
            <span className={`log-badge ${getStatusBadgeClass(data.type)}`}>
              {data.type.toUpperCase()}
            </span>
            <span className="log-offcanvas-timestamp">{data.createdAt}</span>
          </div>

          <div className="log-section">
            <label className="log-section-label">ACTION</label>
            <div className="log-user-context">
              <div className="log-user-info">
                <span className="log-user-meta">• Actor: {data.actor_type.toUpperCase()}</span>
                <span className="log-user-meta">• Detail: {data.actionDetail?.toUpperCase()}</span>
                <span className="log-user-meta">• Status: {data.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <label className="log-section-label">MESSAGE</label>
          <h3 className="log-offcanvas-message">{data.message}</h3>

          {data.actorId && <div className="log-section">
            <label className="log-section-label">USER CONTEXT</label>
            <div className="log-user-context">
              <div className="log-user-avatar">
                <HiOutlineUser size={24} color="#64748B" />
              </div>
              <div className="log-user-info">
                <span className="log-user-name">• ID: {data.actorId}</span>
                <span className="log-user-name">• IP: {data.ipAddress}</span>
              </div>
            </div>
          </div>}

          <div className="log-section log-metadata-section">
            <div className="log-metadata-header">
               <label className="log-section-label">METADATA PAYLOAD</label>
               <button className="log-copy-btn" onClick={handleCopy}>
                 <HiOutlineDocumentDuplicate /> COPY JSON
               </button>
            </div>
            <pre className="log-code-block">
              {JSON.stringify(data.metaData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="log-offcanvas-footer">
          <div className="log-footer-meta">
            <div className="log-footer-col">
              <span className="log-footer-label">SOURCE HOST</span>
              <span className="log-footer-value">AWS-US-EAST-1A</span>
            </div>
            <div className="log-footer-col">
              <span className="log-footer-label">LOG AGENT</span>
              <span className="log-footer-value">CloudWatch-FluentD</span>
            </div>
          </div>
          <div className="log-footer-actions">
            <button className="log-btn-primary">View Traces</button>
            <button className="log-btn-secondary">Generate Ticket</button>
          </div>
        </div> */}

      </div>
    </>
  );
};

export default LogDetailsOffcanvas;
