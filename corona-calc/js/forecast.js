function forecast(xs,fys,total_cases,total_deaths,mortality,phantom,state_pop,current_zero_day,herd_thresh,MIT,LA,county_perc) {
   // this function projects the data forward to find end zero days or herd immunity and outcome values.
   var ys = fys;
   var total_cases_org = total_cases;

   // 14 DAY FIT  
   var lx_14 = linearRegression(xs.slice(Math.max(xs.length - 14 , 1)),ys.slice(Math.max(ys.length - 14, 1)));

   // 7 DAY FIT 
   var lx_7 = linearRegression(xs.slice(Math.max(xs.length - 7 , 1)),ys.slice(Math.max(ys.length - 7, 1)));
 
   // poly fit
   var forecast_result = {
      "14_day" : {},
      "7_day" : {}, 
      "exp" : {}
   };
   forecast_result['exp']['herd_immunity_met'] = 0
   forecast_result['exp']['dys'] = []


   // No real idea what's going on here
   // here we are preping the data for the curve forecast
   // this has to be done with 3rd party fit functions and 
   // the data has to be setup a specific way

   // first we will setup the x axis data (days)
   var rdata = [];
   for (var i  = 0; i <= xs.length -1; i++) {
      var point = [xs[i], ys[i]];
      rdata.push(point);
      var last_x = xs[i];
      // save the last day value as we need it to project forward
      last_x = i  ;
   }

   // setup points structure needed by poly function and add 1200 future days to the end
   var linReg = regression('polynomial', rdata);
   for (var i = 0; i<= 1200; i++) {
      tx = last_x + i;
      point = [tx, 0];
      rdata.push(point);
   }

   // create poly data for the extra points we added to the points array, this will populate the unknown Y from the point/rdata array
   var exp = extraPoints(rdata,linReg);
   var exp_ys = [];

   last_ey = 0;
   curve_total_cases = 0;
   curve_start_day = xs.length;
   curve_end = 0;
   forecast_result['exp']['herd_immunity_met'] = 0;
   forecast_result['exp']['outcome'] = "zero"
   forecast_result['exp']['ys'] = []
   final_status_exp = 0
   // now loop over the forecast data and figure out the final projection 
   // also figure out if the curve has peaked or when it will peak if it can.
   for (var i  = 0; i <= exp.length -1; i++) {
      ey = exp[i].y
      /*
      if (ey > last_ey) {
       console.log("UP", i,ey)
      }
      else {
       console.log("DOWN", i, ey)
      }
      */
      if (i > 30 && ey < 0 && curve_end == 0) {
         curve_end = i
      }
 

      if (ey > 0) {
         curve_total_cases += ey      
         forecast_result['exp']['ys'].push(ey)
         forecast_result['exp']['dys'].push(ey * mortality)
      }


      // populate forecast with poly results 
      forecast_result['exp']['total_cases'] = curve_total_cases 
      forecast_result['exp']['total_dead'] = curve_total_cases * mortality
      forecast_result['exp']['death_percent'] =  ((curve_total_cases * mortality)/ state_pop) * 100
      forecast_result['exp']['total_infected'] = curve_total_cases * phantom
      forecast_result['exp']['infected_percent'] = ((curve_total_cases * phantom) / state_pop) * 100
      if (forecast_result['exp']['death_percent'] + forecast_result['exp']['infected_percent'] >= 80 && final_status_exp == 0) {
         forecast_result['exp']['herd_immunity_met'] = i - current_zero_day
      }
 
      impacted = (forecast_result['exp']['total_cases'] + forecast_result['exp']['total_dead'] + forecast_result['exp']['total_infected']) 
      if (impacted > (herd_thresh * state_pop) && final_status_exp == 0) {
         final_status_exp = 1
         forecast_result['exp']['herd_immunity_met'] = TX - current_zero_day 
         forecast_result['exp']['outcome'] = "herd"
         
      }
      exp_ys.push(ey)
      last_ey = ey
   }

   // now we have ALL of the curve results in the forecast_result so we can make a gauge
   // with it and add it to the table. This is much better than the 7-Day or 14-Day methods.
   forecast_result['exp']['current_zero_day'] = current_zero_day
   forecast_result['exp']['curve_end'] = curve_end  
   forecast_result['exp']['zero_day_met'] = curve_end - current_zero_day
   forecast_result['exp']['total_cases'] = curve_total_cases
   forecast_result['exp']['total_not_infected'] = state_pop - forecast_result['exp']['total_infected'] - forecast_result['exp']['total_dead']
   forecast_result['exp']['niperc'] = (forecast_result['exp']['total_not_infected'] / state_pop) * 100

 

   fxs_14 = []
   fxs_7 = [] 
   fxs_exp = []

   fys_14 = []
   fys_7 = [] 
   fys_exp = []

   // run out 14 day traj
   final_status = 0 
   zero_day_met = 0
   herd_met = 0
   i = 0
   var total_cases_14 = total_cases;
   var total_cases_7 = total_cases;
 
   forecast_result['14_day']['total_cases_start'] = total_cases
   forecast_result['7_day']['total_cases_start'] = total_cases
   forecast_result['14_day']['total_deaths_start'] = total_deaths
   forecast_result['7_day']['total_deaths_start'] = total_deaths
 
   forecast_result['14_day']['zero_day_met'] = 9999
   forecast_result['7_day']['zero_day_met'] = 9999

   // run forecast for 14 day traj
   final_status14 = 0
   final_status7 = 0 
   forecast_result['14_day']['herd_immunity_met'] = 9999
   forecast_result['7_day']['herd_immunity_met'] = 9999
   forecast_result['14_day']['xs'] = []
   forecast_result['7_day']['xs'] = [] 
   forecast_result['14_day']['ys'] = []
   forecast_result['7_day']['ys'] = [] 

   // death ys
   forecast_result['14_day']['dys'] = []
   forecast_result['7_day']['dys'] = [] 
   
   // not infected ys 
   forecast_result['14_day']['niys'] = []
   forecast_result['7_day']['niys'] = [] 
   
   // infected
   forecast_result['14_day']['iys'] = []
   forecast_result['7_day']['iys'] = [] 

   // MIT MODEL OBJ 
   forecast_result['MIT'] = {}
   forecast_result['MIT']['xs'] = []
   forecast_result['MIT']['ys'] = []
   forecast_result['MIT']['yds'] = []
   forecast_result['MIT']['niys'] = []
   forecast_result['MIT']['iys'] = []
   forecast_result['MIT']['total_cases'] = []
   forecast_result['MIT']['total_dead'] = []
   forecast_result['MIT']['death_percent'] = []
   forecast_result['MIT']['total_infected'] = []
   forecast_result['MIT']['infected_percent'] = []

   // LA MODEL OBJ
   forecast_result['LA'] = {}
   forecast_result['LA']['xs'] = []
   forecast_result['LA']['ys'] = []
   forecast_result['LA']['yds'] = []
   forecast_result['LA']['niys'] = []
   forecast_result['LA']['iys'] = []
   forecast_result['LA']['total_cases'] = []
   forecast_result['LA']['total_dead'] = []
   forecast_result['LA']['death_percent'] = []
   forecast_result['LA']['total_infected'] = []
   forecast_result['LA']['infected_percent'] = []


   while(final_status14 == 0 || final_status7 == 0 ) {
      
      TX = current_zero_day + i
      PY14  = lx_14['slope'] * TX + lx_14['intercept']
      PY7   = lx_7['slope'] * TX + lx_7['intercept']
      PY3   = lx_3['slope'] * TX + lx_3['intercept']

      if (PY14 < 0) { PY14 = 0;  }
      if (PY7 < 0) { PY7 = 0; }
  
      if (PY14 > 0 && final_status14 == 0) {   total_cases_14 += PY14  }
      if (PY7 > 0) {  total_cases_7 += PY7  } 

      if (PY14 <= 0 && forecast_result['14_day']['zero_day_met'] == 9999) {
         forecast_result['14_day']['zero_day_met'] = TX - current_zero_day;
         final_status14 = 1;
      }

      if (PY7 <= 0 && forecast_result['7_day']['zero_day_met'] == 9999) {
         forecast_result['7_day']['zero_day_met'] = TX - current_zero_day;
         final_status7 = 1;
      } 

      if (final_status14 != 1) {
         forecast_result['14_day']['total_cases'] = parseInt(total_cases_14 )
         forecast_result['14_day']['total_dead'] = parseInt(total_cases_14 * mortality )
         forecast_result['14_day']['death_percent'] =  ((total_cases_14 * mortality)/ state_pop) * 100
         forecast_result['14_day']['total_infected'] = (total_cases_14 * phantom ) + total_cases_14
         forecast_result['14_day']['infected_percent'] = ((forecast_result['14_day']['total_infected']) / state_pop) * 100
         forecast_result['14_day']['dys'].push(PY14 * mortality)
         forecast_result['14_day']['niys'].push(forecast_result['14_day']['total_not_infected'])
         forecast_result['14_day']['iys'].push(phantom * PY14 )
         forecast_result['14_day']['xs'].push(TX)
         forecast_result['14_day']['ys'].push(PY14)
      }

      if (final_status7 != 1) {
         forecast_result['7_day']['total_cases'] = parseInt(total_cases_7)
         forecast_result['7_day']['total_dead'] = parseInt(total_cases_7 * mortality)
         forecast_result['7_day']['death_percent'] =  ((total_cases_7 * mortality)/ state_pop) * 100
         forecast_result['7_day']['total_infected'] = (total_cases_7 * phantom) + total_cases_7
         forecast_result['7_day']['infected_percent'] = ((forecast_result['14_day']['total_infected']) / state_pop) * 100
         forecast_result['7_day']['dys'].push(PY7 * mortality)
         forecast_result['7_day']['niys'].push(forecast_result['7_day']['total_not_infected'])
         forecast_result['7_day']['iys'].push(phantom * PY7 )
         forecast_result['7_day']['xs'].push(TX)
         forecast_result['7_day']['ys'].push(PY7)
      }
 
      impacted_14t = (forecast_result['14_day']['total_cases'] + forecast_result['14_day']['total_dead'] + forecast_result['14_day']['total_infected']) 
      impacted_7t = (forecast_result['7_day']['total_cases'] + forecast_result['7_day']['total_dead'] + forecast_result['7_day']['total_infected'])
      
      impacted_14 = (forecast_result['14_day']['total_cases'] + forecast_result['14_day']['total_dead'] + forecast_result['14_day']['total_infected']) / state_pop
      impacted_7 = (forecast_result['7_day']['total_cases'] + forecast_result['7_day']['total_dead'] + forecast_result['7_day']['total_infected']) / state_pop
      
      //console.log(state_pop, forecast_result['14_day']['total_cases'], forecast_result['14_day']['total_dead'], forecast_result['14_day']['total_infected'], impacted_14t, impacted_14);
      
      if (impacted_14 > herd_thresh && final_status14 == 0) {
         final_status14 = 1
         forecast_result['14_day']['herd_immunity_met'] = TX - current_zero_day
      }

      if (impacted_7 >= herd_thresh && final_status7 == 0) {
         final_status7 = 1
         forecast_result['7_day']['herd_immunity_met'] = TX - current_zero_day
      }
      

      i = i + 1;
      if (i > 5000) {
         final_status7 = 1;
         final_status14 = 1; 
      }

   }


 if (forecast_result['14_day']['herd_immunity_met'] == 9999) {
    forecast_result['14_day']['outcome'] = "zero"
 }
 else {
    forecast_result['14_day']['outcome'] = "herd"
 }
 if (forecast_result['7_day']['herd_immunity_met'] == 9999) {
    forecast_result['7_day']['outcome'] = "zero"
 } 
 else {
    forecast_result['7_day']['outcome'] = "herd"
 }


   if(   typeof forecast_result['14_day']['total_cases']     == "undefined" ||
         typeof forecast_result['14_day']['total_dead']      == "undefined" ||
         typeof forecast_result['14_day']['total_infected']  == "undefined"  
   ) {
       // We passed the date at 14 days (?)
       impacted_14 = 0;
       impacted_14t = 0;
      
   } else {
      impacted_14 = (forecast_result['14_day']['total_cases'] + forecast_result['14_day']['total_dead'] + forecast_result['14_day']['total_infected']) / state_pop;
   }

   if(   typeof forecast_result['7_day']['total_cases']     == "undefined" ||
         typeof forecast_result['7_day']['total_dead']      == "undefined" ||
         typeof forecast_result['7_day']['total_infected']  == "undefined"  
   ) {
      // We passed the date at 7 days (?)
      impacted_7 = 0;
      impacted_7t = 0;
   } else {
      impacted_7 = (forecast_result['7_day']['total_cases'] + forecast_result['7_day']['total_dead'] + forecast_result['7_day']['total_infected']) / state_pop;
   }
    

   forecast_result['14_day']['total_not_infected'] = state_pop - impacted_14t;  
   forecast_result['14_day']['niperc'] = (impacted_14/state_pop) * 100
    
   forecast_result['7_day']['total_not_infected'] = state_pop - impacted_7t 
   forecast_result['7_day']['niperc'] = (impacted_7 / state_pop) * 100 


   // LOAD IN THE MIT MODEL DATA
 
   // preload zero into the array for past hist 
   last_cases = 0
   last_deaths = total_deaths
   for (i = 0; i <= current_zero_day; i++) {
      forecast_result['MIT']['xs'].push(i)
      forecast_result['MIT']['ys'].push(0)
   }
   // load only future forecast mit data
   
   for (i = 0; i < MIT.Total_Detected.length; i++) {
      if (i == 0) {
         last_cases = MIT.Total_Detected[i]
      }
      new_cases = MIT.Total_Detected[i] - last_cases
      new_deaths = MIT.Total_Detected_Deaths[i] - last_deaths
      console.log( MIT.Total_Detected[i], MIT.Total_Detected_Deaths[i],new_cases, new_deaths)
      new_cases = new_cases * county_perc
      new_deaths = new_deaths * county_perc
      forecast_result['MIT']['xs'].push(i+current_zero_day)
      forecast_result['MIT']['ys'].push(new_cases)
      forecast_result['MIT']['yds'].push(new_deaths)
  
      last_cases = MIT.Total_Detected[i];
      last_deaths= MIT.Total_Detected_Deaths[i];

   }
   
   return(forecast_result);
}
