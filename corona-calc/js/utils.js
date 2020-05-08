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

function dateFormatMIT(s) {
   return s.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
}

function dateFormatMITFromDate(s) {
   var A=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
   var dd = s.getDate();
   var mm = s.getMonth()+1; 
   var yyyy = s.getFullYear();
   return dd+" "+A[mm-1] + " " +yyyy;
}


function linearRegression(x,y){
   var lr = {};
   var n = y.length;
   var sum_x = 0;
   var sum_y = 0;
   var sum_xy = 0;
   var sum_xx = 0;
   var sum_yy = 0;

   for (var i = 0; i < y.length; i++) {

       sum_x += x[i];
       sum_y += y[i];
       sum_xy += (x[i]*y[i]);
       sum_xx += (x[i]*x[i]);
       sum_yy += (y[i]*y[i]);
   } 

   lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
   lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
   lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

   return lr;
}
