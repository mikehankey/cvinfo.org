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

   var reach_0 = -1; // When the trend will reach 0

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
         y_to_return.push(reg['equation'][0]*c + reg['equation'][1]);
      }
      c++;
   }
     
 
   // We trying know if the current reg will reach 0 at one point
   // and if yes... when 
   c = 0;
   if(type=='poly') {

     // When does the poly equation will reach 0?
     // Well we don't use this function anymore for poly 

   } else {
      
      // For linear... it's easy
      c = 0;
      res      = parseFloat(reg['equation'][0])*c + parseFloat(reg['equation'][1]);
      res_next = parseFloat(reg['equation'][0])*(c+1) + parseFloat(reg['equation'][1]);

      
      // When will it reach 0?
      if(res_next<res) { 
         
         while(res>0) {
            res = parseInt(reg['equation'][0]*c + reg['equation'][1]);
            c++;
         }
   
         // Get got the last day!
         n_first_day = new Date(first_day); 
         n_first_day.setDate(n_first_day.getDate() + c);   
         reach_0 = dateFormatMITFromDate(n_first_day); 
 
      } 
      // else: if will never reach 0
   } 

   // Note: reach_raw_d is used for the summary
   return {x:x_to_return, y:y_to_return, reach: reach_0, reach_raw_d: n_first_day, equa: reg['equation'] };
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

   var delta; // Solution of the 2nd deg equation
   var reach_0;
   var reach_raw_d;

   if(start_day_minus==-1) {
      start_day_minus= ydata.length;
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
      console.log("NO SOLUTION");
      reach_0 = -1;
   } else if(delta==0) {
      console.log("NO SOLUTION");
      reach_0 = -b/(2*a);
   } else {
      // We take the max of the 2 solution
      reach_0  = Math.max( (-b-Math.sqrt(delta))/(2*a), 
                           (-b+Math.sqrt(delta))/(2*a)
      );
   }

   console.log("REACH 0 for polynomial solution");
   console.log(reach_0); 
   console.log("RES BACK");
   console.log(a + b*reach_0 + c*Math.pow(reach_0,2));


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