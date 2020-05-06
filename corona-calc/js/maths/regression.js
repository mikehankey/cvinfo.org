/**
 * Compute linear or polynomial regresssion
 * start_day_minus =  the start day from the last item in xdata (ex: 7 or 14) - if -1 all the x_data are taken into account
 * endDate = whatever date you want so it doesn't end at xdata[lenght-1]
 */
function compute_regression_with_dates(xdata,ydata,start_day_minus,endDate,type) {
   var first_day; 

   if(start_day_minus==-1) {
      start_day_minus= ydata.length;
   }  
    
   var c= 0;
   var tmp_data = [];
   var prevDate;

   var x_to_return = [];
   var y_to_return = [];
   first_day = xdata[xdata.length-start_day_minus];
  

   // We don't care about the days as we don't miss any
   for(var i= (ydata.length-start_day_minus); i< ydata.length; i++) {
      tmp_data.push([c,ydata[i]]);
      c++;
   }
   
   if(type=='poly') {
      reg = regression('polynomial', tmp_data); 
   } else {
      reg = regression('linear', tmp_data); 
   }
    
  
   // Remplace the x points by the dates 
   $.each(reg['points'],function(i,v){
      if(i==0) {
         x_to_return.push(first_day); 
      } else {
         prevDate = new Date(first_day);
         prevDate.setDate(prevDate.getDate() + 1);
         x_to_return.push(prevDate); 
         first_day = new Date(prevDate);
      }
      y_to_return.push(parseInt(v[1]));  
   });
 
 
   // Fill all the days
   while(prevDate<endDate) {
      prevDate = new Date(prevDate);
      prevDate.setDate(prevDate.getDate() + 1); 
      x_to_return.push(prevDate); 
      if(type=='poly') {
         y_to_return.push(reg['equation'][2]*c*c + reg['equation'][1]*c + reg['equation'][0]); 
      } else {
         y_to_return.push(c*reg['equation'][0]+ reg['equation'][1] );
      }
      c++;
   }
    
   return {x:x_to_return, y:y_to_return};
}