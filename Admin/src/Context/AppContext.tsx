import { type ReactNode, useState } from "react";
import { AppContext } from "../hooks/useContext";
import type{UserSelectedJSON} from '../pages/UserManagementPage';

export default function AppProvider({children}:{children:ReactNode}){
    const [userSelected, setUserSelected] = useState<UserSelectedJSON[]>([])
    const [totalUser, setTotal]=useState<number>(0)

    // Toggle 1 user: thêm nếu chưa có, xóa nếu đã có
    const handleSelected = (users: UserSelectedJSON[]) => {
        setUserSelected(users)
    }

    const handleSelectMore = (currentPageUsers: UserSelectedJSON[]) => {
        setUserSelected(prev => {
            // Lấy danh sách ID hiện có để kiểm tra nhanh
            const existingIds = new Set(prev.map(u => u.id));
            // Chỉ lấy những user ở trang hiện tại mà chưa có trong list tổng
            const newUsers = currentPageUsers.filter(u => !existingIds.has(u.id));
            return [...prev, ...newUsers];
        });
    };

    const handleRemoveBatch = (idsToRemove: string[]) => {
        setUserSelected(prev => {
            const removeSet = new Set(idsToRemove);
            return prev.filter(user => !removeSet.has(user.id));
        });
    };

    // Clear toàn bộ selection (dùng sau khi gửi notification xong)
    const clearSelected = () => setUserSelected([])

    const setTotalUser=(total:number)=>setTotal(total)

    return(
        <AppContext.Provider value={{userSelected,totalUser, setTotalUser, handleSelected, handleSelectMore,handleRemoveBatch, clearSelected}}>
            {children}
        </AppContext.Provider>
    )
}