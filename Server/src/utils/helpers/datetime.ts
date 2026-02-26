const datetime = () => {
    const today = new Date();

    const year = today.getFullYear();          
    const month = today.getMonth() + 1;       
    const day = today.getDate();            
    const hours = today.getHours();          
    const minutes = today.getMinutes();      
    const seconds = today.getSeconds();      

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
export default datetime;