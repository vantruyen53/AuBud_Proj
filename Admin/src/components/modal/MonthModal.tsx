import { HiChevronLeft, HiChevronRight, HiX  } from "react-icons/hi";
import '../../assets/styles/MonthModal.css'

interface MonthProps{
    year:string, 
    month:string,
    yearOfMonth:string
    setTime:({month, year}:SpecificTime)=>void,
    setYear:(year:string)=>void
    onClose: () => void;
}

interface SpecificTime{
    month:string,
    year:string
}

interface MonthItem{
    id:string,
    title:string
}

export default function MonthModal({year, month, setTime, setYear, yearOfMonth, onClose }: MonthProps){
    const currentYear  = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const MONTHS: MonthItem[] = [
    { id: "01", title: "Jan" },
    { id: "02", title: "Feb" },
    { id: "03", title: "Mar" },
    { id: "04", title: "Apr" },
    { id: "05", title: "May" },
    { id: "06", title: "Jun" },
    { id: "07", title: "Jul" },
    { id: "08", title: "Aug" },
    { id: "09", title: "Sep" },
    { id: "10", title: "Oct" },
    { id: "11", title: "Nov" },
    { id: "12", title: "Dec" },
  ];

  const isFutureMonth = (monthId: string) => {
    const m = parseInt(monthId);
    return parseInt(yearOfMonth) > currentYear || (parseInt(yearOfMonth) === currentYear && m > currentMonth);
  };

  const handleSelectMonth = (item: MonthItem) => {
    if (isFutureMonth(item.id)) return; // chặn chọn tháng tương lai
    setTime({month: item.id, year:yearOfMonth});
    onClose(); // ← chọn xong tự đóng
  };

  const prevYear = () => {
    setYear((parseInt(yearOfMonth) - 1).toString());
  };

  const nextYear = () => {
    if (parseInt(yearOfMonth) < currentYear) setYear((parseInt(yearOfMonth) + 1).toString()); // chặn năm tương lai
  };

  return(
    <div className="modal-overlay">
        <div className="modal-form">
            <button className="modal-month__close" onClick={onClose}>
                <HiX />
            </button>
             <div className="modal-month__header">
                <button className="chevron-btn" onClick={prevYear}><HiChevronLeft /></button>
                <span className="modal-month__text-year">{yearOfMonth}</span>
                <button className="chevron-btn" onClick={nextYear} disabled={parseInt(yearOfMonth) >= currentYear}>
                    <HiChevronRight />
                </button>
            </div>
            
            <div className="modal-month__grid">
                {MONTHS.map(item => {
                    const isSelected = item.id === month && year === yearOfMonth
                    ? true
                    : false;
                    const isFuture = isFutureMonth(item.id);

                    return (
                    <div key={item.id} className="modal-month__item">
                        <button
                            onClick={() => handleSelectMonth(item)}
                            disabled={isFuture}
                            className={[
                            "modal-month__item-btn",
                            isSelected ? "modal-month__item--selected" : "",
                            isFuture   ? "modal-month__item--disabled"  : "",
                            ].join(" ")}
                        >
                            {item.title}
                        </button>
                    </div>
                    );
                })}
            </div>

        </div>
    </div>
  )
}