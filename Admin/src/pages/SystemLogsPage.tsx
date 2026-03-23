import React, { useState, useEffect, useMemo } from 'react';
import {
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineChartBar, // For Total Logs
  HiOutlineExclamationCircle, // For Errors
  HiOutlineExclamation, // For Warnings
  HiOutlineUser, // Placeholder for AI Head
  HiInformationCircle,
  HiOutlineShieldExclamation,
} from 'react-icons/hi';

import Excel from 'exceljs';
import { saveAs } from 'file-saver';

import '../assets/styles/systemLogs.css';
import type{ LogEntryDetailed, LogsStats } from '../model/type/log.type';
import { systemLogApp } from '../application/systemLog.app';

import LoadingModal from '../components/modal/LoadingModal';
import ExportExcelModal from '../components/modal/ExportExcelModal';
import LogDetailsOffcanvas from '../components/modal/LogDetailsOffcanvas';
import CalendarModal from '../components/modal/CalendarModal';

function getDefaultDateRange(): { fromDate: string; toDate: string } {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 30);

  const format = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    fromDate: format(past),
    toDate: format(now),
  };
}

const workSheetName = 'Worksheet-1';

const columns = [
  {header:'Log id', key:'id'},
  {header:'Message', key:'message'},
  {header:'Action type', key:'actor_type'},
  {header:'Created at', key:'createdAt'},
  {header:'Actor id', key:'actorId'},
  {header:'Ip address', key:'ipAddress'},
  {header: 'Type', key:'type'},
  {header: 'Action detail', key:'actionDetail'},
  {header: 'Status', key:'status'},
  {header: 'Meta date', key:'metaData'},
];

const SystemLogsPage: React.FC = () => {
  const logApp = useMemo(()=>new systemLogApp(), [])

  const date = getDefaultDateRange()

  //Paginate
  const [offset, setOffset ] = useState(0)
  const [limit, setLimit ] = useState(25)
  const [currenPage, setCurrenPage] = useState(1)
  const [totalPages , setTotalPages ] = useState(0)

  //Query conditional
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeSearch, setTypesearch] = useState<'actor'|'detail'|'status'|'mess'>('mess');
  const [fromDate, setFromDate]=useState(date.fromDate);
  const [toDate, setToDate]=useState(date.toDate)

  //Data status
  const [selectedLog, setSelectedLog] = useState<LogEntryDetailed | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<LogsStats>({all:0, info:0, warning:0, error:0, auth:0, ai:0})
  const [logsData, setLogsData] = useState<LogEntryDetailed[]>()

  //Modal
  const [loading, setLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [fileName, setFileName]=useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(()=>{
    const fetchData = async()=>{
      const data = await logApp.getStats();
      setStats(data)
    }
    fetchData()
  },[logApp])

  useEffect(()=>{
    const fetchData = async()=>{
      setLoading(true)
      const type = ():'info'|'warning'|'error'|'ai'|'auth'|'all'=>{
        if(activeCategory==="AI Activity")
          return 'ai' as 'info'|'warning'|'error'|'ai'|'auth'|'all'
        else return activeCategory.toLowerCase() as 'info'|'warning'|'error'|'ai'|'auth'|'all';
      }
      const typeSelected = type()
      const {total, logs} = await logApp.getTable(fromDate, toDate, offset.toString(), limit.toString(), typeSelected)

      const pagiration = Math.ceil(total / limit);
      setTotalPages(pagiration)
      setLogsData(logs)
      setLoading(false)
    };
    fetchData();
  }, [fromDate, toDate, limit, offset, activeCategory])

  const handleRowClick = (log: LogEntryDetailed) => {
    setSelectedLog(log);
    setIsSidebarOpen(true);
  };

  const nextPage = ()=>{
    setOffset(pre=>pre+limit)
    setCurrenPage(pre=>pre+1)
  }
  const prevPage = ()=>{
    setOffset(pre=>pre-limit)
    setCurrenPage(pre=>pre-1)
  }

  const categories = [
    { name: 'All', dot: null },
    { name: 'Info', dot: 'info' },
    { name: 'Warning', dot: 'warning' },
    { name: 'Error', dot: 'error' },
    { name: 'Auth', dot: 'auth' },
    { name: 'AI Activity', dot: 'ai' }
  ];

  const data=useMemo(()=>{
    return logsData?.filter(l=>{
      if(searchQuery !=='' || searchQuery!==undefined){
        const query = searchQuery.toLowerCase().trim();
        if(typeSearch==='actor')
           return l.actor_type.toLowerCase().includes(query)
        if(typeSearch==='status')
          return  l.status.toLowerCase().includes(query)
        if(typeSearch==='detail')
          return l.actionDetail?.toLowerCase().includes(query)
        else
          return l.message.toLowerCase().includes(query)
      }
      return l
    })
  }, [searchQuery, logsData, typeSearch])

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
    <div className="system-logs">

      {/* Header */}
      <div className="system-logs__header">
        <div className="system-logs__title-group">
          <h1 className="system-logs__title">System Logs</h1>
          <p className="system-logs__subtitle">Monitor all system activity and events</p>
        </div>
        <button className="system-logs__export-btn" onClick={()=>setIsExportModalOpen(true)}>
          <HiOutlineDownload style={{ fontSize: '16px' }} />
          Export Logs
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="logs-stats">
        <div className="logs-stat-card">
          <div className="logs-stat-card__icon-wrapper icon--total">
            <HiOutlineChartBar />
          </div>
          <div className="logs-stat-card__content">
            <span className="logs-stat-card__label">Total Logs</span>
            <span className="logs-stat-card__value">{stats.all}</span>
          </div>
        </div>
        
        <div className="logs-stat-card">
          <div className="logs-stat-card__icon-wrapper icon--info">
            {/* Using user icon as a proxy for the AI head icon in screenshot */}
            <HiInformationCircle />
          </div>
          <div className="logs-stat-card__content">
            <span className="logs-stat-card__label">Info</span>
            <span className="logs-stat-card__value">{stats.info}</span>
          </div>
        </div>

        <div className="logs-stat-card">
          <div className="logs-stat-card__icon-wrapper icon--warnings">
            <HiOutlineExclamation />
          </div>
          <div className="logs-stat-card__content">
            <span className="logs-stat-card__label">Warnings</span>
            <span className="logs-stat-card__value">{stats.warning}</span>
          </div>
        </div>

        <div className="logs-stat-card">
          <div className="logs-stat-card__icon-wrapper icon--errors">
            <HiOutlineExclamationCircle />
          </div>
          <div className="logs-stat-card__content">
            <span className="logs-stat-card__label">Errors</span>
            <span className="logs-stat-card__value">{stats.error}</span>
          </div>
        </div>

        <div className="logs-stat-card">
          <div className="logs-stat-card__icon-wrapper icon--auth">
            {/* Using user icon as a proxy for the AI head icon in screenshot */}
            <HiOutlineShieldExclamation />
          </div>
          <div className="logs-stat-card__content">
            <span className="logs-stat-card__label">Auth</span>
            <span className="logs-stat-card__value">{stats.auth}</span>
          </div>
        </div>

        <div className="logs-stat-card">
          <div className="logs-stat-card__icon-wrapper icon--ai">
            {/* Using user icon as a proxy for the AI head icon in screenshot */}
            <HiOutlineUser />
          </div>
          <div className="logs-stat-card__content">
            <span className="logs-stat-card__label">AI Activity</span>
            <span className="logs-stat-card__value">{stats.ai}</span>
          </div>
        </div>

      </div>

      {/* Filters Area */}
      <div className="logs-filter-box">
        {/* Top Row: Search & Categories */}
        <div className="logs-filter-row">
          <select className="log-type-search" defaultValue={typeSearch} onChange={(e) =>setTypesearch(e.target.value as "actor" | "detail" | "status" | "mess" ??"mess")}>
            <option value="actor">ACTOR</option>
            <option value="status">STATUS</option>
            <option value="detail">ACTION DETAIL</option>
            <option value="mess">MESSAGE</option>
          </select>
          <div className="logs-search">
            <HiOutlineSearch className="logs-search__icon" />
            <input
              type="text"
              className="logs-search__input"
              placeholder="Search logs by actor, status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="logs-categories">
            {categories.map(cat => (
              <button
                key={cat.name}
                className={`logs-category-btn ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => {setActiveCategory(cat.name);setOffset(0); setCurrenPage(1)}}
              >
                {cat.dot && <span className={`category-dot dot--${cat.dot}`}></span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: Dates */}
        <div className="logs-filter-row">
          <div className="logs-date-inputs" 
            onClick={() =>{ setIsCalendarOpen(true);setOffset(0); setCurrenPage(1)}} 
            style={{ cursor: 'pointer' }}
          >
            <div className="logs-date-wrapper">
              <span className="logs-date-label">From</span>
              <div className="logs-date-input-custom">{fromDate}</div>
            </div>
            <div className="logs-date-wrapper">
              <span className="logs-date-label">To</span>
              <div className="logs-date-input-custom">{toDate}</div>
            </div>
          </div>

          <CalendarModal 
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            fromDate={fromDate}
            toDate={toDate}
            onSelectFrom={setFromDate}
            onSelectTo={setToDate}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="logs-table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              {/* Empty TH for the Marker Column */}
              <th style={{ width: 4, padding: 0 }}></th>
              <th>Timestamp</th>
              <th>Type</th>
              <th>Actor</th>
              <th>Status</th>
              <th>Action detail</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {data?.map(log => {
              // Determine styles based on log status
              let badgeTypeClass = '';
              let badgeStatusClass = ''
              let rowMarkerClass = '';

              switch (log.type) {
                case 'error':
                  badgeTypeClass = 'type-badge--error';
                  rowMarkerClass = 'row-marker--error';
                  break;
                case 'warning': badgeTypeClass = 'type-badge--warning'; break;
                case 'info': badgeTypeClass = 'type-badge--info'; break;
                default: badgeTypeClass = 'type-badge--auth'; break;
              }

              switch (log.status){
                case 'success':
                  badgeStatusClass= 'status-badge--success'; break;
                case 'failure': badgeStatusClass= 'status-badge--error';break;
                case 'pending': badgeStatusClass= 'status-badge--pedding';break;
              }

              return (
                <tr key={log.id} onClick={() => handleRowClick(log)} style={{ cursor: 'pointer' }}>
                  {/* Marker Column */}
                  <td className="marker-cell">
                    <span className={`row-marker ${rowMarkerClass}`}></span>
                  </td>

                  <td className="cell-timestamp">{log.createdAt.split('.')[0]}</td>

                  <td>
                    <span className={`type-badge ${badgeTypeClass}`}>{log.type}</span>
                  </td>

                  <td className="cell-timestamp">{log.actor_type}</td>
                  <td>
                    <span className={`type-badge ${badgeStatusClass}`}>{log.status}</span>
                  </td>

                  <td className="cell-message">{log.actionDetail}</td>
                  <td className="cell-message">{log.message}</td>
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

      <LogDetailsOffcanvas 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        data={selectedLog} 
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

export default SystemLogsPage;
