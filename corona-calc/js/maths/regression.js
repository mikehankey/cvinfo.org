/**
 * Compute linear or 2th deg polynomial regresssion
 * start_day_minus =  the start day from the last item in xdata (ex: 7 or 14) - if -1 all the x_data are taken into account
 * endDate = whatever date you want so it doesn't end at xdata[lenght-1]
 */
function compute_regression_with_dates(xdata,ydata,start_day_minus,endDate,type) {
   var first_day; 

   var n_first_day;
   if(start_day_minus==-1) {
      start_day_minus= ydata.length;
   }  
    
   var c= 0;
   var tmp_data = [];
   var prevDate;

   var x_to_return = [];
   var y_to_return = [];

   var reach_0 = -1;        // When the trend will reach 0
   var res_first_deg_equ;   // Res of First Deg equation 

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

   prevDate = new Date(first_day);
   prevDate.setDate(prevDate.getDate() - 1); 
   endDate  = new Date(endDate);
   c = 0;
  
   // Fill all the days
   while(prevDate<endDate) {
      prevDate = new Date(prevDate);
      prevDate.setDate(prevDate.getDate() + 1); 
      x_to_return.push(prevDate); 

      if(type=='poly') {
         y_to_return.push(reg['equation'][2]*c*c + reg['equation'][1]*c + reg['equation'][0]); 
      } else {
         // We don't push negative numbers
         if(reg['equation'][0]*c + reg['equation'][1]>=0) {
            y_to_return.push(reg['equation'][0]*c + reg['equation'][1]);
         }  
      }
      
      c++;
   }
     
 
   // We trying know if the current reg will reach 0 at one point
   // and if yes... when 
   c = 0;

   // Well we don't use this function anymore for poly!
   if(type!=='poly') {
      
      // For linear... it's easy
      c = 0;

      // Result of the first deg equation
      res_first_deg_equ = -reg['equation'][1]/reg['equation'][0];

      if(!isNaN(res_first_deg_equ) && res_first_deg_equ>0) {
         // We got a result, we now compute the corresponding day
         n_first_day = new Date(first_day); 
         n_first_day.setDate(n_first_day.getDate() +   Math.round(res_first_deg_equ));   
         reach_0 = dateFormatMITFromDate(n_first_day); 
      }
      
      
      
   }

   // Note: reach_raw_d is used for the summary
   return { 
      x:x_to_return, 
      y:y_to_return, 
      reach: reach_0, 
      reach_raw_d: n_first_day, 
      equa: reg['equation'],
      first_day: first_day
   };
}


/**
 * Compute Xth deg polynomial regresssion
 * start_day_minus =  the start day from the last item in xdata (ex: 7 or 14) - if -1 all the x_data are taken into account
 * endDate = whatever date you want so it doesn't end at xdata[lenght-1]
 */
function compute_Xdeg_poly_regression_with_dates(xdata,ydata,start_day_minus,endDate,order) {

   var first_day; 
   var reg_solution;
   var real_start_day_minus = start_day_minus;
   var c= 0;
   var tmp_xdata = [];
   var tmp_y;
   var prevDate;

   var x_to_return = [];
   var y_to_return = [];

   // Solution of the 2nd deg equation
   var delta;  
   var a,b,c,sol_1,sol_0;
   var reach_0;
   var reach_raw_d;

   if(start_day_minus==-1) {
      start_day_minus = ydata.length;
   }  
   
   first_day = xdata[xdata.length-start_day_minus];
   c = xdata.length-start_day_minus;
   
   // We don't care about the days as we don't miss any
   for(var i= (xdata.length-start_day_minus); i< xdata.length; i++) {
      tmp_xdata.push(c);
      c++;
   } 

   // If all data (start_day_minus=-1), c=0
   if(real_start_day_minus==-1) {
      c=0; 
   }

   // We solve the orderth degre poly equation
   reg_solution = reg_poly(tmp_xdata,ydata,order);

   // Now that we have the solution 
   // we fill the computed values  a + bx^1 + cx^2 + dx^3 + ex^4
   prevDate = first_day;
   
   while(prevDate<endDate) {
      // Fill x (date)
      x_to_return.push(first_day);
      prevDate = new Date(first_day);
      prevDate.setDate(prevDate.getDate() + 1);
      first_day = new Date(prevDate);

      tmp_y = 0
      // Compute y (equation solution)
      // a + bx^1 + cx^2 + dx^3 + ex^4...
      $.each(reg_solution, function(i,v) {
         if(i==0) {
            tmp_y+= parseFloat(v);
         } else {
            tmp_y+= parseFloat(v)*Math.pow(c,i);
         }
      })  

      // We don't push negative numbers
      if(tmp_y>0) {
         y_to_return.push(tmp_y);
      } else {
         y_to_return.push(0);
      }
      c++;
   } 
   

   // Now we try to know if there's at least one solution for 
   // a + bx  + cx²  = 0 (to know if we're going to reach 0 at one point)
   // WARNING IT ONLY WORKS WITH the 2nd deg!!
   // EQUAT: ax²+bx+c=0 
   a = parseFloat(reg_solution[2]);
   b = parseFloat(reg_solution[1]);
   c = parseFloat(reg_solution[0]);
 
   delta = Math.pow(b,2) - 4*a*c;
   if(delta<0) { 
      // NO SOLUTION
      sol_0 = -1;
      reach_0 = -1;
   } else if(delta==0) {
     // 1 SOLUTION
      sol_0 = -b/(2*a);
   } else {
      // 2 SOLUTION 
      sol_0  =  (-b-Math.sqrt(delta))/(2*a); 
      sol_1  =  (-b+Math.sqrt(delta))/(2*a); 
      // We take the max
      sol_0 = Math.max(sol_1,sol_0); 
   }
 
   if(sol_0 != -1 ) {
      
      // We need to find the day that corresponds to sol_0
      // Since we're using this function always with the entire data 
      first_data = new Date(xdata[0]);
      
   }


   return {x:x_to_return, y:y_to_return, equa: reg_solution};
 
}



/***
 * Solve Xth degre 
 */
function reg_poly(xdata,ydata,order) {
   var xMatrix = [],xMatrixT,dot1,dotInv,dot2,solution;
   var xTemp = [];
   var yMatrix = numeric.transpose([ydata]);

   // Build the Matrix
   for (var j=0;j<xdata.length;j++) {
      xTemp = [];
      for(i=0;i<=order;i++) {
        xTemp.push(1*Math.pow(xdata[j],i));
      }
      xMatrix.push(xTemp);
   }

   xMatrixT = numeric.transpose(xMatrix);
   dot1     = numeric.dot(xMatrixT,xMatrix);
   dotInv   = numeric.inv(dot1);
   dot2     = numeric.dot(xMatrixT,yMatrix);
   solution = numeric.dot(dotInv,dot2);

   //console.log("Coefficients a + bx^1 + cx^2 + dx^3 + ex^4 + ...");
   //console.log(solution);

   return solution;
}