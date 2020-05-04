function convert_zero_day_to_date(xs,dates) {
   var jsdates = [];
   for (i = 0; i <= xs.length -1 ; i++) {
      dt = dates[i].substring(0,4)+ "-" + dates[i].substring(4,6) + "-" + dates[i].substring(6,8);
      jsdates.push(new Date(dt) );
   } 
   return(jsdates)
}

function usFormat(n) {
   return String(n).replace(/(.)(?=(\d{3})+$)/g,'$1,');
 } 
 
 function dateFormat(s) {
    return s.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
 }