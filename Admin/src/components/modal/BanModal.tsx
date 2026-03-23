import React from "react";
import { HiOutlinePaperAirplane, HiOutlineCheckCircle } from 'react-icons/hi';

interface BanProps{
    onConfirm:()=>void,
    onClose:()=>void,
    setReason:(reason:string)=>void,
    email:string,
    toState:'ban'|'active'
}


export const BanConfirmModal:React.FC<BanProps>=({onConfirm, onClose,setReason, email, toState})=>{
    const textareaStyle = {
        border:'none',
        width:'100%',
        height:'150px',
        outline:'none',
        marginTop:'15px',
        marginBottom:'15px',
        backgroundColor:'#f8fafc',
        padding:'15px',
        borderRadius:'12px'
    }
    return(
        <div className="notif-modal-overlay">
              <div className="notif-modal">
                <div className="notif-modal__hero">
                  <div className="notif-modal__icon-circle">
                    <HiOutlinePaperAirplane className="notif-modal__plane-icon" />
                  </div>
                </div>
                
                <div className="notif-modal__body">
                  <h2 className="notif-modal__title">Confirm {toState==='ban'?'Ban':'Unban'} Account</h2>
                  <p style={{fontWeight:700, textAlign:'center'}}>{email}</p>

                  <textarea 
                    style={textareaStyle} 
                    name="reason" 
                    id="reason" 
                    autoFocus 
                    onChange={(e)=>setReason(e.target.value)}
                    placeholder="Message..."
                  />

                  <div className="notif-modal__actions">
                    <button className="notif-btn notif-btn--cancel" onClick={onClose}>
                      Cancel
                    </button>
                    <button className="notif-btn notif-btn--confirm" onClick={()=>onConfirm()}>
                      <HiOutlineCheckCircle /> Confirm & Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
    )
}