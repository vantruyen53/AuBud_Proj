export const createIconAcc = (name: string = 'No Name') => {
  const safeName = name?.trim() || 'No Name';
  const nameArray = safeName.split(' ').filter(s => s.length > 0); 
  return `${nameArray[0][0].toUpperCase()}${nameArray[nameArray.length - 1][0].toUpperCase()}`;
};