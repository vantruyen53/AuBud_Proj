import React, { useState, useEffect, useMemo  } from 'react';
import { 
  HiOutlineSearch, 
  HiOutlineChatAlt2,
  HiOutlineDotsHorizontal
} from 'react-icons/hi';
import '../assets/styles/userTable.css';
import Excel from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

//Utils
import { createIconAcc } from '../utils/helpers/IconText';
import { useAppContext } from '../hooks/useContext';

//Logic
import { UserManaApp, type User } from '../application/userMana.app';

//Modal
import { BanConfirmModal } from '../components/modal/BanModal';
import SuccessModal from '../components/modal/SuccessModal';
import LoadingModal from '../components/modal/LoadingModal';
import ExportExcelModal from '../components/modal/ExportExcelModal';

interface UserBannedProps{
  userId?:string,
  email?:string,
  name?:string,
  reason?:string,
  toState?:'active'|'ban'|''
}

export interface UserSelectedJSON{
  id:string,
  email:string
}

const columns = [
  {header:'User Id', key:'id'},
  {header:'User Name', key:'name'},
  {header:'User Email', key:'email'},
  {header:'User Role', key:'role'},
  {header:'Joined Date', key:'join'},
  {header:'Last active', key:'lastActive'},
  {header: 'Status', key:'status'}
];

const workSheetName = 'Worksheet-1';

const UserManagementPage: React.FC = () => {
  const {handleSelected, handleSelectMore, handleRemoveBatch, setTotalUser}=useAppContext();
  const nav = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fileName, setFileName]=useState('')

  const [banResule, setBanResule] =useState<{isOpen:boolean,status:boolean, message:string}>({isOpen:false,status:true, message:''})
  const [userbanned, setUserBanned] = useState<UserBannedProps>()
  
  // Filters (mock implementation)
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all'|'admin'|'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'ban'|'deleted'>('all');
  
  //Paginate
  const [offset, setOffset ] = useState(0)
  const [limit, setLimit ] = useState(25)
  const [currenPage, setCurrenPage] = useState(1)
  const [totalPages , setTotalPages ] = useState(0)

  const [isModalOpen, setIsModalOpen] =useState(false)
  const [loading, setLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);


  useEffect(()=>{
    const fetchData = async()=>{
      setLoading(true)
      const {total, users} = await UserManaApp.get(roleFilter, statusFilter, offset, limit)
      setUsers(users)
      setTotalUser(total)
      const pagiration = Math.ceil(total / limit);
      setTotalPages(pagiration)
      setLoading(false)
    }
    fetchData()
  },[roleFilter,statusFilter, offset, limit, banResule,])

  const data=useMemo(()=>{
    return users.filter(t=>{
      if(searchQuery !=='' || searchQuery!==undefined){
        const query = searchQuery.toLowerCase().trim();
        return  t.email.toLowerCase().includes(query)
      }
    })
  }, [searchQuery, users])

  // --- Selection Logic ---

  //Select each user in table
  const handleSelectAllUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentPageUsers = data.map(u => ({ id: u.id, email: u.email }));
    const currentPageIds = data.map(u => u.id);

    if (e.target.checked) {
        // 1. Cập nhật Local State (cho UI dấu tích tại dòng)
        setSelectedIds(prev => {
            const next = new Set(prev);
            currentPageIds.forEach(id => next.add(id));
            return next;
        });
        // 2. Cập nhật Context (Cộng dồn vào tổng)
        handleSelectMore(currentPageUsers);
    } else {
        // 1. Cập nhật Local State (Xóa tích trang này)
        setSelectedIds(prev => {
            const next = new Set(prev);
            currentPageIds.forEach(id => next.delete(id));
            return next;
        });
        // 2. Cập nhật Context (Chỉ xóa những người thuộc trang này)
        handleRemoveBatch(currentPageIds);
    }
};

  //Select all user in table
  const handleSelectOne = (id: string) => {
    const newParams = new Set(selectedIds);
    if (newParams.has(id)) {
      newParams.delete(id);
    } else {
      newParams.add(id);
    }
    setSelectedIds(newParams);
    const userIds:string[]=[];
    for(const i of newParams){
      userIds.push(i)
    }

    const selectedObjects: UserSelectedJSON[] = Array.from(newParams).map(selectedId => {
      // Tìm user trong data gốc để lấy email tương ứng
      const user = data.find(u => u.id === selectedId);
      return { id: selectedId, email: user?.email as string};
    });

    handleSelected(selectedObjects);
  };

  const isAllSelected = data.length > 0 && data.every(u => selectedIds.has(u.id));
  const isIndeterminate = data.some(u => selectedIds.has(u.id)) && !isAllSelected;

  // --- Actions ---

  //Ban or unban 
  const handleToggleStatus = (id: string, email:string, name:string, toState:'active'|'ban') => {
    setUserBanned({...userbanned, userId:id, email, name, toState})
    setIsModalOpen(true)
  };

  //Close modal ban
  const handleClose =()=>{
    setUserBanned({userId:'', email:"", name:'', reason:'', toState:''});
    setIsModalOpen(false)
  }

  //Send ban or unban action
  const handleConfirm= async()=>{
    setLoading(true)

    setIsModalOpen(false)
    const result = await UserManaApp.ban(userbanned?.userId as string, userbanned?.email as string, 
      userbanned?.name as string, userbanned?.reason as string, userbanned?.toState as 'ban'|'active')
      
    if (result.status){
      setIsModalOpen(false)
      setLoading(false)
      setBanResule({isOpen:true, status:true, message:result.message})
    }
    else{
      setIsModalOpen(false)
      setLoading(false)
      setBanResule({isOpen:true, status:false, message:result.message})
    }
  }


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
      data.forEach(d=>worksheet.addRow(d));

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

  const navToSendNotif = ()=>{
    nav('/notifications');
  }

  return (
    <div className="user-management">
      
      {/* Page Header */}
      <div className="user-management__header">
        <h1 className="user-management__title">User Management</h1>
        <button className="user-management__export-btn" onClick={()=>setIsExportModalOpen(true)}>Export</button>
      </div>

      {/* Filters Row */}
      <div className="user-filters">
        <div className="user-filters__search">
          <HiOutlineSearch className="user-filters__search-icon" />
          <input 
            type="text" 
            className="user-filters__search-input"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          className="user-filters__dropdown"
          value={roleFilter}
          onChange={(e) => {setRoleFilter(e.target.value as 'all'|'admin'|'user');setOffset(0); setCurrenPage(1)}}
        >
          <option value="all">Role: All</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <select 
          className="user-filters__dropdown"
          value={statusFilter}
          onChange={(e) => {setStatusFilter(e.target.value as 'all'|'active'|'ban'|'deleted');setOffset(0); setCurrenPage(1)}}
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Bulk Action Alert */}
      {selectedIds.size > 0 && (
        <div className="bulk-alert">
          <div className="bulk-alert__text">
            {selectedIds.size} {selectedIds.size === 1 ? 'user' : 'users'} selected
          </div>
          <div className="bulk-alert__actions">
            <button className="bulk-alert__btn" onClick={navToSendNotif}>
              <HiOutlineChatAlt2 className="bulk-alert__btn--icon" />
              Send Notification
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  className="custom-checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAllUser}
                  aria-label="Select all users"
                />
              </th>
              <th>User</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => {
              const isSelected = selectedIds.has(user.id);
              
              return (
                <tr key={user.id} className={isSelected ? 'selected' : ''}>
                  {/* Checkbox */}
                  <td>
                    <input 
                      type="checkbox" 
                      className="custom-checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(user.id)}
                      aria-label={`Select ${user.name}`}
                    />
                  </td>
                  
                  {/* User Profile */}
                  <td>
                    <div className="user-cell">
                      <div className="sidebar__user-avatar">
                        <span>{createIconAcc(user.name)}</span>
                      </div>
                      <div className="user-cell__info">
                        <span className="user-cell__name">{user.name}</span>
                        <span className="user-cell__email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Role */}
                  <td className="text-dark">{user.role}</td>
                  
                  {/* Dates */}
                  <td>{user.join}</td>
                  <td>{user.lastActive}</td>
                  
                  {/* Status Toggle/Badge */}
                  <td>
                    {user.status === 'deleted' ? (
                      <span className="status-pill status-pill--deleted">Deleted</span>
                    ) : (
                      <div className="status-cell">
                        <label className="status-switch">
                          <input 
                            type="checkbox" 
                            checked={user.status === 'active'}
                            onChange={() => handleToggleStatus(user.id, user.email, user.name, user.status === 'active'?'ban':'active')}
                          />
                          <span className="status-switch__slider"></span>
                        </label>
                        <span className={`status-label ${user.status === 'active' ? 'status-label--active' : 'status-label--banned'}`}>
                          {user.status === 'active' ? 'Active' : 'Banned'}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Actions Dropdown Trigger */}
                  <td>
                    <button className="action-btn" aria-label="Row actions">
                      <HiOutlineDotsHorizontal />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div className="logs-pagination">
          <div className="logs-pagination__left">
            <div className="logs-pagination__rows">
              <span>Rows per page:</span>
              <select 
                className="logs-pagination__select" 
                defaultValue={limit}
                onChange={(e) =>setLimit(parseInt(e.target.value))}
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
      {
        isModalOpen &&
        <BanConfirmModal
          onClose={()=>handleClose()}
          email={userbanned?.email as string}
          toState={userbanned?.toState as "ban" | "active"}
          setReason={(reason:string)=>setUserBanned({...userbanned,reason })}
          onConfirm={handleConfirm}
        />
      }
      <SuccessModal
         result={banResule}
        onClose={()=>setBanResule({isOpen:false, status:true, message:''})}
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

export default UserManagementPage;
