import React, { useMemo, useState, useEffect } from 'react';
import { 
  HiOutlineUsers, HiOutlineUser, HiOutlineMail, HiOutlineBell, 
  HiOutlineDeviceMobile,
  HiOutlineClock,
  HiOutlinePaperAirplane,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlineCheckCircle, HiOutlineUserGroup,HiChevronDown, HiChevronRight
} from 'react-icons/hi';
import '../assets/styles/notifications.css';
import { useNavigate } from 'react-router-dom';

//Modal;
import NotificationConfirmModal from '../components/modal/NotificationConfirmModal';
import LoadingModal from '../components/modal/LoadingModal';
import SuccessModal from '../components/modal/SuccessModal';

//Utils
import { useAppContext } from '../hooks/useContext';

//Service && Type
import { NotificationApp, type AdminNotifaction,type NotificationDTO } from '../application/notification.app';

// --- Mock Data ---
// interface HistoryEntry {
//   id: string;
//   sentAt: { date: string, time: string };
//   recipients: string;
//   channels: ('email' | 'push' | 'inapp')[];
//   title: string;
//   status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed';
// }

// const MOCK_HISTORY: HistoryEntry[] = [
//   {
//     id: 'H1',
//     sentAt: { date: 'Oct 24, 2023', time: '09:45 AM' },
//     recipients: 'All Users (12.4k)',
//     channels: ['email', 'push'],
//     title: 'New Monthly Budget Rep...',
//     status: 'Sent'
//   },
//   {
//     id: 'H2',
//     sentAt: { date: 'Oct 26, 2023', time: '14:00 PM' },
//     recipients: 'Premium Tier (1.2k)',
//     channels: ['push'],
//     title: 'Exclusive Investment Tips',
//     status: 'Scheduled'
//   },
//   {
//     id: 'H3',
//     sentAt: { date: 'Oct 22, 2023', time: '10:10 AM' },
//     recipients: 'Specific: 1 User',
//     channels: ['email'],
//     title: 'Account Security Alert',
//     status: 'Draft'
//   },
//   {
//     id: 'H4',
//     sentAt: { date: 'Oct 20, 2023', time: '18:20 PM' },
//     recipients: 'All Users (12.4k)',
//     channels: ['email', 'push', 'inapp'],
//     title: 'System Maintenance To...',
//     status: 'Failed'
//   }
// ];

const UserNotificationsPage: React.FC = () => {
  const {userSelected, totalUser, setTotalUser}=useAppContext()
  const navigate = useNavigate()
  const _app = useMemo(()=>new NotificationApp(), [])

  // Composer State
  const [sendTo, setSendTo] = useState<'all' | 'specific'>(userSelected.length===0?'all':'specific');
  const [channels, setChannels] = useState<{email: boolean, push: boolean, inapp: boolean}>({email: false,push: true,inapp: true});
  const [showWarningModal,setShowWarningModal] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<{type:'channels'|'status'|'all', value:string|undefined}>(
    {type:'all', value:undefined}
  )
  const [loading, setLoading] = useState(false);

  //Field payLoad
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sentResule, setSentResule] =useState<{isOpen:boolean,status:boolean, message:string}>({isOpen:false,status:true, message:''})

  //Data state
  const [history, setHistory] = useState<AdminNotifaction[]>()

  //Paginate
  const [offset, setOffset ] = useState(0)
  const [limit, setLimit ] = useState(25)
  const [currenPage, setCurrenPage] = useState(1)
  const [totalPages , setTotalPages ] = useState(0)

  useEffect(()=>{
    const fetch = async()=>{
      setLoading(true)

      const {totalRow, totalUser, data} = await _app.get(notificationFilter?.type, notificationFilter.value,offset, limit)

      setHistory(data)
      setTotalUser(totalUser)
      const pagiration = Math.ceil(totalRow / limit);
      setTotalPages(pagiration)

      setLoading(false)
    }
    fetch()
  }, [notificationFilter, offset, limit])


  // Handlers
  const toggleChannel = (channel: 'email' | 'push' | 'inapp') => {
    setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  const nextPage = ()=>{
    setOffset(pre=>pre+limit)
    setCurrenPage(pre=>pre+1)
  }
  const prevPage = ()=>{
    setOffset(pre=>pre-limit)
    setCurrenPage(pre=>pre-1)
  }

  const handleSendClick = () => {
    if(Object.entries(channels).filter(([,value])=>value===true).length<=0){
      alert("Please select an channels")
      return;
    }
    if(!title || title===''){
      alert("Please enter title!"); return}
    if(!message || message===''){
      alert("Please enter message!");return}

    setIsModalOpen(true);
  };

  const handleConfirmSend = async () => {
    setIsModalOpen(false);
    setLoading(true)
    const payLoad:NotificationDTO ={
      title,
      message,
      recipients: sendTo,
      metaData: userSelected,
      channels: Object.entries(channels)
      .filter(([, value]) => value === true).map(([key]) => key),
    };

    const result = await _app.send(payLoad)

    if (result.status){
      setSentResule({isOpen:true, status:true, message:result.message})
      setTitle('')
      setMessage('')
      setSendTo('all')
    }
    else{
      setSentResule({isOpen:true, status:false, message:result.message})
    }
    setLoading(false)
  };

  // Memoized derived properties for the modal
  const recipientCountText = sendTo === 'all' ? `${totalUser}` : `${userSelected.length}`;

  const formatChannels = (channels:{email: boolean, push: boolean, inapp: boolean}, isString:boolean=true) => {
    const labels:Record<string, string> = {
      email: 'Email',
      push: 'Push Notification',
      inapp: 'In-App'
    };
    
    const selected = Object.entries(channels)
      .filter(([, value]) => value === true)
      .map(([key]) => labels[key] || key);

    if(isString)
      return selected.length > 0 ? selected.join(', ') : 'None';
    return selected
  };

// Bên trong Component:
const selectedChannelsText = formatChannels(channels);

  return (
    <div className="notifications-page">
      
      {/* Header */}
      <div className="notif-header">
        <h1 className="notif-title">Send Notification</h1>
        <p className="notif-subtitle">Compose and send targeted notifications to your users across multiple platforms.</p>
      </div>

      {/* Composer Card */}
      <div className="notif-card composer-card">

        <div>
          {/* Send To */}
          <div className="composer-section" style={{marginBottom:'32px'}}>
            <label className="composer-label">Send To</label>
            <div className="send-to-options">
              <button 
                className={`send-to-card ${sendTo === 'all' ? 'active' : ''}`}
                onClick={() => setSendTo('all')}
              >
                <div className="send-to-card__content">
                  <HiOutlineUsers className="send-to-card__icon" />
                  <div className="send-to-card__text">
                    <span className="send-to-card__title">All Users</span>
                    <span className="send-to-card__desc">{sendTo==='all'?`${totalUser} total recipients`:'Send to all users'}</span>
                  </div>
                </div>
                {sendTo === 'all' && <div className="send-to-card__check"><HiOutlineCheckCircle /></div>}
              </button>

              <button 
                className={`send-to-card ${sendTo === 'specific' ? 'active' : ''}`}
                onClick={() =>{if(userSelected.length===0){ setShowWarningModal(true)} else{ setSendTo('specific')}}}
              >
                <div className="send-to-card__content">
                  <HiOutlineUser className="send-to-card__icon" />
                  <div className="send-to-card__text">
                    <span className="send-to-card__title">Specific User</span>
                    <span className="send-to-card__desc">{sendTo==='specific'?`${userSelected.length} total recipients`:'Select specific users'}</span>
                  </div>
                </div>
                {sendTo === 'specific' && <div className="send-to-card__check"><HiOutlineCheckCircle /></div>}
              </button>
            </div>
          </div>

          {/* Send Via */}
          <div className="composer-section">
            <label className="composer-label">Send Via</label>
            <div className="send-via-options">
              <button 
                className={`channel-pill ${channels.email ? 'active' : ''}`}
                onClick={() => toggleChannel('email')}
              >
                <HiOutlineMail /> Email
              </button>
              <button 
                className={`channel-pill ${channels.push ? 'active' : ''}`}
                onClick={() => toggleChannel('push')}
              >
                <HiOutlineBell /> Push Notification
              </button>
              <button 
                className={`channel-pill ${channels.inapp ? 'active' : ''}`}
                onClick={() => toggleChannel('inapp')}
              >
                <HiOutlineDeviceMobile /> In-App Notification
              </button>
            </div>
          </div>
        </div>

        <div style={{flexGrow:1}}>
          {/* Compose */}
          <div className="composer-section" style={{marginBottom:'32px'}}>
            <label className="composer-label">Compose Message</label>
            
            <div className="input-group">
              <input 
                type="text" 
                className="compose-input" 
                placeholder="Notification Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
              />
              <div className="char-count">{title.length} / 100 characters</div>
            </div>

            <div className="input-group">
              <textarea 
                className="compose-textarea" 
                placeholder="Write your message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <div className="char-count">{message.length} / 500 characters</div>
            </div>
          </div>

          {/* Schedule */}
          <div className="schedule-box" style={{marginBottom:'32px'}}>
            <div className="schedule-box__left">
              <HiOutlineClock className="schedule-box__icon" />
              <div className="schedule-box__text">
                <span className="schedule-box__title">Schedule for later</span>
                <span className="schedule-box__desc">Select a specific date and time</span>
              </div>
            </div>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="schedule-toggle" 
                className="toggle-switch-checkbox"
                checked={isScheduled}
                onChange={() => setIsScheduled(!isScheduled)}
              />
              <label className="toggle-switch-label" htmlFor="schedule-toggle">
                <span className="toggle-switch-inner" />
                <span className="toggle-switch-switch" />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="composer-actions">
            <button className="btn-send" onClick={handleSendClick}>
              <HiOutlinePaperAirplane className="btn-send__icon" /> Send Notification
            </button>
            {/* <button className="btn-draft">Save as Draft</button> */}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="notif-card history-card">
        <div className="history-header">
          <h2 className="history-title">Notification History</h2>
          <div className="history-actions">
            <div className="filter-dropdown">
              <button 
                className="filter-dropdown__trigger" 
                onClick={() => setIsOpen(!isOpen)}
              >
                <HiOutlineFilter /> <span>{notificationFilter?.value?notificationFilter?.value.toUpperCase():'Filter'}</span> <HiChevronDown />
              </button>

              {isOpen && (
                <ul className="filter-dropdown__menu">
                  <span 
                    style={{color: 'rgb(48, 49, 51)', padding:' 10px 15px', textAlign:'center', fontSize:'14px', cursor:'pointer'}}
                    onClick={()=>{setNotificationFilter({type:'all', value:undefined}); setIsOpen(false); setOffset(0);setCurrenPage(1)}}
                  >Tất cả (All)</span>
                  {/* Nhóm Status */}
                  <li className="filter-dropdown__item has-submenu">
                    <span>Trạng thái (Status)</span> <HiChevronRight />
                    <ul className="filter-dropdown__submenu">
                      <li onClick={() => {setNotificationFilter({type:'status',value: 'send'}); setIsOpen(false); setOffset(0);setCurrenPage(1)}}>Đã gửi (Send)</li>
                      <li onClick={() => {setNotificationFilter({type:'status',value: 'schedule'}); setIsOpen(false); setOffset(0);setCurrenPage(1)}}>Lịch gửi (Schedule)</li>
                      <li onClick={() => {setNotificationFilter({type:'status',value: 'failure'}); setIsOpen(false); setOffset(0);setCurrenPage(1)}}>Lỗi (Failure)</li>
                    </ul>
                  </li>

                  {/* Nhóm Channels */}
                  <li className="filter-dropdown__item has-submenu">
                    <span>Kênh gửi (Channels)</span> <HiChevronRight />
                    <ul className="filter-dropdown__submenu">
                      <li onClick={() => {setNotificationFilter({type:'channels',value: 'email'}); setIsOpen(false)}}>Email</li>
                      <li onClick={() => {setNotificationFilter({type:'channels',value: 'push'}); setIsOpen(false)}}>Push App</li>
                      <li onClick={() => {setNotificationFilter({type:'channels',value: 'inapp'}); setIsOpen(false)}}>In-App</li>
                    </ul>
                  </li>
                </ul>
              )}
            </div>
            <div className="history-search">
              <HiOutlineSearch className="history-search__icon" />
              <input type="text" placeholder="Search history..." className="history-search__input" />
            </div>
            {/* <button className="btn-filter">
              <HiOutlineFilter /> Filter
            </button> */}
          </div>
        </div>

        <table className="history-table">
          <thead>
            <tr>
              <th>Sent At</th>
              <th>Recipients</th>
              <th>Channels</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history?.map(row => {
              
              let statusClass = '';
              switch(row.status) {
                case 'send': statusClass = 'status-sent'; break;
                case 'schedule': statusClass = 'status-scheduled'; break;
                case 'Draft': statusClass = 'status-draft'; break;
                case 'failure': statusClass = 'status-failed'; break;
              }

              return (
                <tr key={row.id}>
                  <td>
                    <div className="cell-date">{row.sendAt}</div>
                  </td>
                  <td className="cell-recipients">{row.recipients}</td>
                  <td>
                    <div className="cell-channels">
                      {row.channels.includes('email') && <div className="channel-icon-mini"><HiOutlineMail /></div>}
                      {row.channels.includes('push') && <div className="channel-icon-mini"><HiOutlineBell /></div>}
                      {row.channels.includes('in-app') && <div className="channel-icon-mini"><HiOutlineDeviceMobile /></div>}
                    </div>
                  </td>
                  <td className="cell-title">{row.title}</td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>{row.status}</span>
                  </td>
                  <td style={{textAlign:'center'}}>
                    <button className="btn-action-dots"><HiOutlineEye  /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div className="logs-pagination">
          <div className="logs-pagination__left">
            <div className="logs-pagination__rows">
              <span>Rows per page:</span>
              <select 
                className="logs-pagination__select" 
                defaultValue={limit}
                onChange={(e) =>{setLimit(parseInt(e.target.value)); setCurrenPage(1);setOffset(0)}}
              >
                <option value="3">3</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          <div className="logs-pagination__right">
            <span className="pagination-text">Page {currenPage} of {totalPages}</span>
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={()=>prevPage()} disabled={currenPage===1}>&lt;</button>
              <button className="pagination-btn" onClick={()=>nextPage()} disabled={currenPage===totalPages}>&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <NotificationConfirmModal 
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSend}
          recipientCount={recipientCountText}
          selectedChannels={selectedChannelsText as string}
          messageTitle={title || 'Untitled Notification'}
        />
      )}

      {/* Modal nhắc nhở chọn User */}
      {showWarningModal && (
        <div className="send-to-modal__overlay">
          <div className="send-to-modal__container">
            <div className="send-to-modal__icon">
              <HiOutlineUserGroup />
            </div>
            <h3 className="send-to-modal__title">No recipient has been selected</h3>
            <p className="send-to-modal__message">
              You are selecting to send to <strong>Specific Users</strong> but the list is empty.
              Please return to the <strong>User Management page</strong> to select who will receive this notification.
            </p>
            <div className="send-to-modal__actions">
              <button 
                className="send-to-modal__btn send-to-modal__btn--cancel" 
                onClick={() => setShowWarningModal(false)}
              >
                Cancel
              </button>
              <button 
                className="send-to-modal__btn send-to-modal__btn--navigate"
                onClick={() => {
                  // Điều hướng đến trang User Management
                  navigate('/users'); 
                  setShowWarningModal(false);
                }}
              >
                Select recipient
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
         result={sentResule}
        onClose={()=>setSentResule({isOpen:false, status:true, message:''})}
      />

      <LoadingModal isOpen={loading}/>
    </div>
  );
};

export default UserNotificationsPage;
