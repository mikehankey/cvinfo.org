/**
 * Get county list + # of cases at day-1
 * from State and fill the related select element
 * @param {*} json_data 
 */
function getAllCounties(json_data) {
   var counties = json_data['county_stats'];
   var county_list = {}, all_cases;

   $.each(counties, function(key,vals) { 
      if(key!=='Unknown') {
         county_list[key] = vals.county_stats[vals.county_stats.length-1].cases;
      }
   })
 
   return county_list;
}
 

function usFormat(n) {
   return String(n).replace(/(.)(?=(\d{3})+$)/g,'$1,');
} 
 
function dateFormat(s) {
   return s.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
}

function dateFormatMIT(s) {
   return s.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
}

function dateFormatMITFromDate(s) {
   var A=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
   var dd = s.getDate();
   var mm = s.getMonth()+1; 
   var yyyy = s.getFullYear();
   return A[mm-1] + " " + dd +  ", " +yyyy;
}

 