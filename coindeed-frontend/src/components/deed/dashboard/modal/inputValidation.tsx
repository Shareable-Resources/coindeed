import moment from 'moment';

export function validateNotEqualToString(strA: any, strB: any, setStrAState: any, setIsValidStrA: any) {
  if (strA !== undefined && strA !== strB) {
    setIsValidStrA(true);
    return true;
  }
  setIsValidStrA(false);
  return false;
}

export function validateDecimal(strA: any, decimalPlaces: any, min: any, max: any, setStrA: any, setIsValidStrA: any){
  let pattern = `^\\d+(\\.\\d{0,${decimalPlaces}})?$`
  let regex = new RegExp(pattern)
  if(strA !== undefined && regex.test(strA)){
      let floatA = parseFloat(strA)
      if((min !== undefined &&  floatA < min) || (max !== undefined && floatA > max)){
          setIsValidStrA(false)
          return false
      }
      setIsValidStrA(true)
      return true
  }
  if(strA === '') setStrA('')
  setIsValidStrA(false)
  return false
}

export function validateNumber(strA: any, min: any, max: any, setStrA: any, setIsValidStrA: any){
  let pattern = "^\\d+(\\.\\d+)?$";
  let regex = new RegExp(pattern)
  if(strA && regex.test(strA)){
      let floatA = parseFloat(strA)
      if((min !== undefined && floatA < min) || (max !== undefined && floatA > max)){
          setIsValidStrA(false)
          return false
      }
    setIsValidStrA(true)
    return true
  }
  if(strA === '') setStrA('')
  setIsValidStrA(false)
  return false
}

export function validateDate(dateA: any, minDate: any, maxDate: any, setDateA: any, setIsValidDateA: any) {
  if (
    dateA !== undefined &&
    (minDate === undefined || dateA > minDate) &&
    (maxDate === undefined || dateA < maxDate) &&
    dateA > moment().unix()
  ) {
    setIsValidDateA(true);
    return true;
  }
  setIsValidDateA(false);
  return false;
}
