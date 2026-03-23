import React, { useState, useMemo, useEffect } from 'react';
import { HiOutlineDownload, HiBookmark,HiOutlineSearch,HiOutlineBookmark } from 'react-icons/hi';
import '../assets/styles/feedback.css';
import FeedbackOffcanvas from '../components/FeedbackOffcanvas';
import Excel from 'exceljs';
import { saveAs } from 'file-saver';

import { createIconAcc } from '../utils/helpers/IconText';

//Modal
import ExportExcelModal from '../components/modal/ExportExcelModal';
import LoadingModal from '../components/modal/LoadingModal';

//Type
import type { FeedbackEntity } from '../model/type/feedback.type';

//Service
import { FeedbackApp } from '../application/feedback.app';

const workSheetName = 'Worksheet-1';

const columns = [
  {header:'Id', key:'id'},
  {header:'User Id', key:'userId'},
  {header:'User Name', key:'userName'},
  {header:'User Email', key:'email'},
  {header:'Content ', key:'content'},
  {header:'Created at', key:'createdAt'},
  {header:'Rating', key:'rating'},
  {header: 'Status', key:'isMark'},
];

const UserFeedbackPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Offcanvas state
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntity | null>(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [fileName, setFileName]=useState('')

  //Filter state
  const [type, setType]=useState<"all"|'today'|'isMark'>('all')
  const [rating, setRating]=useState<'1'|'2'|'3'|'4'|'5'|'all'>('all')
  const [searchQuery, setSearchQuery] = useState('');
  const [typeSearch, setTypesearch] = useState<'name'|'email'|'content'>('content');

  //Paginate
  const [offset, setOffset ] = useState(0)
  const [limit, setLimit ] = useState(25)
  const [currenPage, setCurrenPage] = useState(1)
  const [totalPages , setTotalPages ] = useState(0)

  //Data state
  const [stats, setStats] = useState<{total:number, totalMark:number, totalToday:number}>()
  const [feedbacks, setFeedback]= useState<FeedbackEntity[]>([])

  const _app = useMemo(()=>new FeedbackApp(),[])

  useEffect(()=>{
    const fetch = async()=>{
      setLoading(true)
      const {total, totalMark, totalToday} =await _app.getStats();
      setStats({total, totalMark, totalToday})
      setLoading(false)
    }
    fetch()
  },[])

  useEffect(()=>{
    const fetch = async()=>{
      setLoading(true)

      const {total, data} = await _app.get(type, offset.toString(), limit.toString(), rating)

      const pagiration = Math.ceil(total/limit);

      setTotalPages(pagiration);
      setFeedback(data)

      setLoading(false)
    }
    fetch()
  },[type, offset, limit, rating])

  //Search filter
  const data=useMemo(()=>{
    return feedbacks.filter(f=>{
      if(searchQuery !=='' || searchQuery!==undefined){
        const query = searchQuery.toLowerCase().trim();
        if(typeSearch==='name')
           return f.userName.toLowerCase().includes(query)
        if(typeSearch==='email')
          return  f.email.toLowerCase().includes(query)
        else
          return f.content.toLowerCase().includes(query)
      }
      return f
    })
  }, [searchQuery, feedbacks, typeSearch])

  const handleRowClick = (feedback: FeedbackEntity) => {
    setSelectedFeedback(feedback);
    setIsOffcanvasOpen(true);
  };

  const handleMark = async (id:string, currentStatus:number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    // 1. Optimistic Update: Cập nhật Table State ngay lập tức
    setFeedback(prev => 
      prev.map(item => item.id === id ? { ...item, isMark: newStatus } : item)
    );

    // 2. Cập nhật Stats State ngay lập tức
    setStats(prev => {
      // Nếu chưa có stats (đang loading hoặc lỗi), không làm gì cả
      if (!prev) return prev;

      return {
        ...prev,
        totalMark: newStatus === 1 ? prev.totalMark + 1 : prev.totalMark - 1
      };
    });
    try {
      // 3. Gọi API cập nhật server
      const result = await _app.mark(id, newStatus);
      if(!result.status)
        alert(`Cập nhật thất bại, ${result.message}`);
    } catch{
      // 4. Rollback nếu lỗi (Quan trọng!)
      // Nếu lỗi, bạn phải trả lại trạng thái cũ để tránh sai lệch dữ liệu
      alert("Cập nhật thất bại, vui lòng thử lại!");
      // Logic set lại state cũ ở đây...
    }
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  const nextPage = ()=>{
    setOffset(pre=>pre+limit)
    setCurrenPage(pre=>pre+1)
  }
  const prevPage = ()=>{
    setOffset(pre=>pre-limit)
    setCurrenPage(pre=>pre-1)
  }

  const handleExportData = async()=>{
    const workBook = new Excel.Workbook();
    
    try{
          const fName =fileName || 'User-management';
    
          // creating one worksheet in workbook
          const worksheet = workBook.addWorksheet(workSheetName);
    
          // add worksheet columns
          // each columns contains header and its mapping key from data
          worksheet.columns = columns;
    
          // updated the font for first row.
          worksheet.getRow(1).font = { bold: true };
    
          // loop through all of the columns and set the alignment with width.
          worksheet.columns.forEach(column => {
            column.width = column.header?.length as number + 5;
            column.alignment = { horizontal: 'center' };
          });
    
          // loop through data and add each one to worksheet
          data?.forEach(d=>worksheet.addRow(d));
    
          // loop through all of the rows and set the outline style.
          // worksheet.eachRow({ includeEmpty: false }, row => {
          //   // store each cell to currentCell
          //   const currentCell = row._cells;
    
          //   // loop through currentCell to apply border only for the non-empty cell of excel
          //   currentCell.forEach(singleCell => {
          //     // store the cell address i.e. A1, A2, A3, B1, B2, B3, ...
          //     const cellAddress = singleCell._address;
    
          //     // apply border
          //     worksheet.getCell(cellAddress).border = {
          //       top: { style: 'thin' },
          //       left: { style: 'thin' },
          //       bottom: { style: 'thin' },
          //       right: { style: 'thin' }
          //     };
          //   });
          // });
    
          // write the content using writeBuffer
          const buff = await workBook.xlsx.writeBuffer();
    
          // download the processed file
          saveAs(new Blob([buff]), `${fName}.xlsx`)
    
          setIsExportModalOpen(false)
          setFileName('')
        }catch (error:unknown) {
          console.error('<<<ERRROR>>>', error);
          console.error('Something Went Wrong', error);
        } finally {
          // removing worksheet's instance to create new one
          workBook.removeWorksheet(workSheetName);
    }
  }

  return (
    <div className="feedback-page">
      
      {/* Page Header */}
      <div className="fb-header">
        <div className="fb-header-left">
          <h1 className="fb-title">Customer Feedback</h1>
          <span className="fb-subtitle">View and manage feedback submitted by users</span>
        </div>
        <button className="system-logs__export-btn" onClick={()=>setIsExportModalOpen(true)}>
          <HiOutlineDownload style={{fontSize: '18px'}} /> Export
        </button>
      </div>

      {/* Stat Cards */}
      <div className="fb-stats-grid">
        
        {/* Card 1 */}
        <div className="fb-stat-card">
          <div className="fb-stat-header">TOTAL FEEDBACK</div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto'}}>
            <span className="fb-stat-value">{stats?.total}</span>
            {/* <span className="trend-green">↗ +12%</span> */}
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="fb-stat-card">
          <div className="fb-stat-header">New Today</div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto'}}>
            <span className="fb-stat-value">{stats?.totalToday}</span>
            <span className="pill-attention">ATTENTION</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="fb-stat-card">
          <div className="fb-stat-header">Mark</div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
            <span className="fb-stat-value">{stats?.totalMark}</span>
            {/* <div className="progress-bar">
              <div className="progress-fill" style={{width: '85%'}}></div>
            </div> */}
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="fb-filter-bar">
        <select className="log-type-search" 
          defaultValue={typeSearch}
          onChange={(e) =>{setTypesearch(e.target.value as "content" | "name" | "email" ??"content");
            setOffset(0); setCurrenPage(1)
          }}
        >
          <option value="content">MESSAGE</option>
          <option value="name">NAME</option>
          <option value="email">EMAIL</option>
        </select>
        <div className="fb-search-wrap">
          <HiOutlineSearch className="fb-search-icon" />
          <input 
            type="text" 
            className="fb-search-input" 
            placeholder="Search feedback message, user, or email..."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>

        <div className="fb-filter-dropdown">
          <span className="fb-filter-label">FILTER BY:</span>
          <select 
            className="log-type-search" 
            defaultValue={type} 
            onChange={(e)=>{setType(e.target.value as "all" | "today" | "isMark"); setOffset(0); setCurrenPage(1)}}
          >
            <option value="all">All</option>
            <option value="today">TODAY</option>
            <option value="isMark">MARK</option>
          </select>
        </div>

        <div className="fb-filter-dropdown">
          <span className="fb-filter-label">RATING:</span>
          <select className="fb-rating nav-star filled" 
            defaultValue={rating} 
            onChange={(e)=>setRating(e.target.value as "all" | "1" | "2" | "3" | "4" | "5")}
          >
            <option className='nav-star' value="all">All</option>
            <option className='nav-star filled' value="5">★ (5)</option>
            <option className='nav-star filled' value="4">★ (4)</option>
            <option className='nav-star filled' value="3">★ (3)</option>
            <option className='nav-star filled' value="2">★ (2)</option>
            <option className='nav-star filled' value="1">★ (1)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-card">
        <table className="fb-table">
          <thead>
            <tr>
              <th>USER</th>
              <th>SUBMITTED DATE</th>
              <th>RATING</th>
              <th>MESSAGE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              
              // Map status to badge class
              // let badgeClass = 'badge-read';
              // if (row.status === 'Unread') badgeClass = 'badge-unread';
              // if (row.status === 'Resolved') badgeClass = 'badge-resolved';

              // Unread rows show a blue left border marker
              const rowClass = row.isMark === 1 ? 'unread' : '';

              return (
                <tr key={row.id} className={rowClass} onClick={() => handleRowClick(row)}>
                  <td>
                    <div className="cell-user">
                       <div className="sidebar__user-avatar"><span>{createIconAcc(row.userName)}</span></div>
                      <div className="fb-user-info">
                        <span className="fb-user-name">{row.userName}</span>
                        <span className="fb-user-email">{row.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-date">
                      <div>{row.createdAt}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`nav-star ${star <= parseInt(row.rating) ? 'filled' : 'empty'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="cell-message">{row.content}</div>
                  </td>
                  <td>
                    {
                      <button className={`fb-badge`} onClick={(e)=>{e.stopPropagation();handleMark(row.id, row.isMark)}}>
                        {row.isMark===1?<HiBookmark/>:<HiOutlineBookmark/>}
                      </button>
                    }
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
              <select className="logs-pagination__select" defaultValue={limit} onChange={(e) =>{setLimit(parseInt(e.target.value)); setCurrenPage(1);setOffset(0)}}>
                <option value="10">10</option>
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

      {/* Offcanvas Overlay Component */}
      <FeedbackOffcanvas 
        isOpen={isOffcanvasOpen} 
        onClose={closeOffcanvas}
        data={selectedFeedback}
      />

      <LoadingModal isOpen={loading}/>

      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportData}
        setFileName={(fileName:string)=>setFileName(fileName)}
        fileName={fileName}
      />
    </div>
  );
};

export default UserFeedbackPage;
