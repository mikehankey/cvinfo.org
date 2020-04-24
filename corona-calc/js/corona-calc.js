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

function forecast_html(pred, type, state_name) {

   var $gaugesCont = $('#'+type.replace(/\s/g, '')+"_cont"); 
   var $forteen_days = $gaugesCont.find('.14days');
   var $seven_days = $gaugesCont.find('.7days');
   var $three_days = $gaugesCont.find('.3days');
   var $new =  $gaugesCont.find('.new'); 
    

   if (pred[0] == 9999) {
      $forteen_days.attr('data-ratio',1);
   } else {
      $forteen_days.attr('data-ratio',pred[0]/100);
   }
   
   if (pred[1] == 9999) {
      $seven_days.attr('data-ratio',1);
   } else {
      $seven_days.attr('data-ratio',pred[1]/100);
   }

   if (pred[2] == 9999) {
      $three_days.attr('data-ratio',1);
   } else {
      $three_days.attr('data-ratio',pred[2]/100);
   }

   if (pred[3] == 9999) {
      $new.attr('data-ratio',1); 
   }  else if (pred[3] <= 0) {
      $new.attr('data-ratio',0); 
   }
   else {
      $new.attr('data-ratio',pred[3]/100);
   }
   
   setTimeout(function(){ 
      start_gauges($gaugesCont);
  },2500);


   out = ""
   if (pred[0] == 9999) {
      out += "<li class='bad'>Based on the " + type + " 14 day trajectory, " + state_name + " will not reach a zero day. </li>"
   }
   else {
      out += "<li class='good'>Based on the " + type + " 14 day trajectory, " + state_name + " will reach the zero day in " + pred[0].toString() + " more days.</li>"
   }
   if (pred[1] == 9999) {
      out += "<li class='bad'>Based on the " + type + " 7 day trajectory, " + state_name + " will not reach a zero day. "
   }
   else {
      out += "<li class='good'>Based on the " + type + " 7 day trajectory, " + state_name + " will reach the zero day in " + pred[1].toString() + " more days."
   }
   if (pred[2] == 9999) {
      out += "<li class='bad'>Based on the " + type + " 3 day trajectory, " + state_name + " will not reach a zero day. "
   }
   else {
      out += "<li class='good'>Based on the " + type + " 3 day trajectory, " + state_name + " will reach the zero day in " + pred[2].toString() + " more days."
   }
   if (pred[3] == 9999) {
      out += "<li class='bad'>Based on the " + type + " curve, " + state_name + " will not reach a zero day in the next 60 days. "
   }
   else if (pred[3] <= 0) {
      out += "<li class='good'>Based on the " + type + " curve, the zero day for " + state_name + " has already passed. "
   }
   else {
      out += "<li class='good'>Based on the " + type + " curve, " +  state_name + " will reach the zero day in " + pred[3].toString() + " more days."
   }
   out += "</ul>"
   return(out)
}

function doSomethingWithJsonData(json_data ) {
   var out = "";
   var state_name = json_data['summary_info'].state_name;
   var state_pop = json_data['summary_info'].state_population * 1000000;
   var ss = json_data['state_stats'];

   var date_vals = [];
   var zero_day_vals = [];
   var total_cases_vals = [];
   var new_cases_vals = [];
   var new_deaths_vals = [];
   var case_growth_vals = [];
   var death_growth_vals = [];
   var decay_vals = [];
   var mortality_vals = [];

   var zd = 0;
   var last_growth = 0;

   // Prepare all data
   ss.forEach(function (arrayItem) {
      date_vals.push(arrayItem.date);
      zero_day_vals.push(zd);
      total_cases_vals.push(arrayItem.cases);
      new_cases_vals.push(arrayItem.new_cases);
      new_deaths_vals.push(arrayItem.new_deaths);
      case_growth_vals.push(arrayItem.cg_last);
      death_growth_vals.push(arrayItem.dg_last);
      mortality_vals.push(arrayItem.mortality);
      zd = zd + 1
      last_date = arrayItem.date
      decay = arrayItem.cg_last - last_growth
      decay_vals.push(decay);
      last_growth = arrayItem.cg_last 
   });

   nc_org = new_cases_vals.slice();
   nc_org2 = new_cases_vals.slice();
   zdv = zero_day_vals.slice();

   // Draw graphs & Gauges for New Cases
   title = state_name.toUpperCase() + " NEW CASES " + last_date;
   fit_days = 14;
   pred = makeGraph(zero_day_vals, nc_org,title, "zero day", "new cases", "new_cases_div", fit_days, 60);
   out = forecast_html(pred, "new case ", state_name);
   out = "";
   document.getElementById("new_cases_forecast").innerHTML= out;
 
   alert("zdv")
   alert(zdv.length)

   zdv2 = zero_day_vals.slice();
   zdv3 = zero_day_vals.slice();
   zdv4 = zero_day_vals.slice();
   zdv5 = zero_day_vals.slice();
   zdv6 = zero_day_vals.slice();
   title = state_name.toUpperCase() + " GROWTH " + last_date

   pred = makeGraph(zdv, case_growth_vals,title, "zero day", "growth", "growth_div", fit_days, 60)
   out = forecast_html(pred, "growth", state_name, )
   out = ""
   document.getElementById("growth_forecast").innerHTML= out
   alert("zdv2")
   alert(zdv.length)

   title = state_name.toUpperCase() + " NEW DEATHS " + last_date
   alert(zdv2.length)
   alert(new_deaths_vals.length)
   out2 = makeGraph(zdv2, new_deaths_vals,title, "zero day", "new deaths", "new_deaths_div", fit_days, 60)
   //document.getElementById("results_panel").innerHTML= out

   title = state_name.toUpperCase() + " DEATH GROWTH " + last_date
   out2 = makeGraph(zdv3, death_growth_vals,title, "zero day", "death growth", "deaths_growth_div", fit_days, 60)

   title = state_name.toUpperCase() + " GROWTH DECAY " + last_date

   // case decay
   fitsObj = getFits(zdv4, decay_vals)
   out2 = plot_data_line(zdv4, decay_vals,fitsObj['ys2'], fitsObj.ys3, fitsObj.ys4, fitsObj.exp_ys, "zero day", "growth decay", title, "decay_div", "line")

   // mortality div
   fitsObj = getFits(zdv5, mortality_vals)
   title = state_name.toUpperCase() + " MORTALITY " + last_date

   out2 = plot_data_line(zdv5, mortality_vals,fitsObj['ys2'], fitsObj.ys3, fitsObj.ys4, fitsObj.exp_ys, "zero day", "mortality percentage", title, "mortality_div", "line")

    var total_cases = new_cases_vals.reduce(function(a, b){
        return a + b;
    }, 0);

   phantom = 4
   mortality = .02
   current_zero_day = nc_org2.length

   // This is the MAIN summary at the top of the page.
   fr = forecast(zdv6,nc_org2,total_cases,mortality,phantom,state_pop,current_zero_day) 
   // See corona-ui-data.js
   fillSummary(state_name,fr);
 

   pie_data = [fr['14_day'].total_cases, fr['14_day'].total_infected, fr['14_day'].total_not_infected, fr['14_day'].total_dead]
   pie_lb = ['Confirmed Cases ' + usFormat(parseInt(fr['14_day'].total_cases)), 'Infected ' + usFormat(parseInt(fr['14_day'].total_infected)), 'Not Infected ' + usFormat(parseInt(fr['14_day'].total_not_infected)), 'Deaths ' + usFormat(parseInt(fr['14_day'].total_dead))]
   title = "Predicted Outcome (14-day trajectory)"
   dv = "new_cases_pie_14"
   plot_pie(pie_data,pie_lb,title,dv) 
    
   

}



function getFits(xs,ys) {
   nxs = []
   ys2  = []
   ys3  = []
   ys4  = []
   exp_ys  = []
   for (var i = 0; i <= xs.length; i++) {
      nxs.push(xs[i])
   }

   // curve fit

   var rdata = []
   for (var i  = 0; i <= xs.length -1; i++) {
      var point = [xs[i], ys[i]]
      rdata.push(point)
      var last_x = xs[i]
   }
  
   var linReg = regression('polynomial', rdata);
   var linRegEq = "Lin: y = " + linReg.equation[0].toFixed(4) + "x + " + linReg.equation[1].toFixed(2) + ", r2 = " + linReg.r2.toFixed(3);
   for (var i = 0; i<= 60; i++) {
      tx = last_x + i
      point = [tx, ys[i]]
      rdata.push(point)

   }

   var exp = extraPoints(rdata,linReg)

   var exp_ys = []
   for (var i  = 0; i <= exp.length -1; i++) {
      ey = exp[i].y
      exp_ys.push(ey)
   }

   // 14 DAY FIT
   lr_xs = xs.slice(Math.max(xs.length - 14, 1))
   lr_ys = ys.slice(Math.max(ys.length - 14, 1))
   lx_14 = linearRegression(lr_xs,lr_ys)
   // 7 DAY FIT
   lr_xs = xs.slice(Math.max(xs.length - 7 , 1))
   lr_ys = ys.slice(Math.max(ys.length - 7, 1))
   lx_7 = linearRegression(lr_xs,lr_ys)

   lr_xs = xs.slice(Math.max(xs.length - 3 , 1))
   lr_ys = ys.slice(Math.max(ys.length - 3, 1))
   lx_3 = linearRegression(lr_xs,lr_ys)


   for (var i  = 0; i <= xs.length -1; i++) {
      X = xs[i]
      Y = ys[i]
      if (xs.length - 14 < i + 1) {
         PY14 = lx_14['slope'] * X + lx_14['intercept']
      }
      else {
         PY14 = 0
      }
      if (xs.length - 7 < i + 1) {
         PY7 = lx_7['slope'] * X + lx_7['intercept']
      }
      else {
         PY7 = 0
      }
      if (xs.length - 3 < i + 1) {
         PY3 = lx_3['slope'] * X + lx_3['intercept']
      }
      else {
         PY3 = 0
      }
      if (PY14 < 0) {
         PY14 = 0
      }
      if (PY7 < 0) {
         PY7 = 0
      }
      if (PY3 < 0) {
         PY3 = 0
      }
      ys2.push(PY14)
      ys3.push(PY7)
      ys4.push(PY3)
      //out += PY.toString() + "<BR>";
   }

   // add 60 day projections
   last_x = X
   last_zd14_day = 9999
   last_zd7_day = 9999
   last_zd3_day = 9999
   last_exp_day = 9999

   proj_days = 60
   exp_pos = 0
   for (var i = 0; i <= proj_days; i++) {
      TX = last_x + i
      PY14 = lx_14['slope'] * TX + lx_14['intercept']
      PY7 = lx_7['slope'] * TX + lx_7['intercept']
      PY3 = lx_3['slope'] * TX + lx_3['intercept']
      xs.push(TX)
      ys.push(0)
      ys2.push(PY14)
      ys3.push(PY7)
      ys4.push(PY3)
      if (last_zd14_day == 9999 && PY14 <= 0) {
         last_zd14_day = i
      }
      if (last_zd7_day == 9999 && PY7 <= 0) {
         last_zd7_day = i
      }
      if (last_zd3_day == 9999 && PY3 <= 0) {
         last_zd3_day = i
      }
      if (last_exp_day == 9999 && exp_ys[i+last_x] <= 0 && exp_pos == 1) {
         last_exp_day = i
      }
      if (exp_ys[i+last_x] > 0) {
         exp_pos = 1
      }

   }





   robj = {
      "nxs" : nxs,
      "ys2" : ys2,
      "ys3" : ys3,
      "ys4" : ys4,
      "exp_ys" : exp_ys
   }




   return(robj)
}


function extraPoints(data,polyReg) {
    name = "polynomial"
    var extrapolatedPts = [];
    for(var i = 0; i < data.length; i++){
        var val = data[i][0];
        switch(name){
        case "polynomial":
            extrapolatedPts.push({x: val, y: polyReg.equation[2] * Math.pow(val,2) + polyReg.equation[1] * val + polyReg.equation[0]});
            break;
        case "exponential":
            extrapolatedPts.push({x: val, y: expoReg.equation[0] * Math.exp(val * expoReg.equation[1])}); //or use numbers.js per https://gist.github.com/zikes/4279121, var regression = numbers.statistic.exponentialRegression(pts);
            break;
        case "power":
            extrapolatedPts.push({x: val, y: powReg.equation[0] * Math.pow(val,powReg.equation[1])});
            break;
        case "logarithmic":
            extrapolatedPts.push({x: val, y: logReg.equation[0] + logReg.equation[1] * Math.log(val)});
            break;
        case "linear":
        default:
            extrapolatedPts.push({x: val, y: linReg.equation[0] * val + linReg.equation[1]});
        }
    }
    return extrapolatedPts;
}

function plot_pie(xd,lb,title,dv) {
   var data = [{
      labels: lb,
      values: xd,
      type: 'pie'
   }];
   var layout = {
      title: title
   }
   Plotly.newPlot(dv, data,layout)
}


function forecast(xs,fys,total_cases,motality,phantom,state_pop,current_zero_day ) {
   // this function projects the data forward to find end zero days or herd immunity and outcome values.
   ys = fys
   total_cases_org = total_cases
   // 14 DAY FIT
   lr_xs = xs.slice(Math.max(xs.length - 14 , 1))
   lr_ys = ys.slice(Math.max(ys.length - 14, 1))
   lx_14 = linearRegression(lr_xs,lr_ys)

   // 7 DAY FIT
   lr_xs = xs.slice(Math.max(xs.length - 7 , 1))
   lr_ys = ys.slice(Math.max(ys.length - 7, 1))
   lx_7 = linearRegression(lr_xs,lr_ys)

   // 3 DAY FIT
   lr_xs = xs.slice(Math.max(xs.length - 3 , 1))
   lr_ys = ys.slice(Math.max(ys.length - 3, 1))
   lx_3 = linearRegression(lr_xs,lr_ys)

   // poly fit
   forecast_result = {
      "14_day" : {},
      "7_day" : {},
      "3_day" : {},
      "exp" : {}
   }

   var rdata = []
   for (var i  = 0; i <= xs.length -1; i++) {
      var point = [xs[i], ys[i]]
      rdata.push(point)
      var last_x = xs[i]
      last_x = i
   }
   var linReg = regression('polynomial', rdata);
   var linRegEq = "Lin: y = " + linReg.equation[0].toFixed(4) + "x + " + linReg.equation[1].toFixed(2) + ", r2 = " + linReg.r2.toFixed(3);
   for (var i = 0; i<= 1200; i++) {
      tx = last_x + i
      point = [tx, 0]
      rdata.push(point)

   }
  
   var exp = extraPoints(rdata,linReg)



   var exp_ys = []
   last_ey = 0
   curve_total_cases = total_cases_org
   curve_start_day = xs.length
   curve_end = 0
   forecast_result['exp']['herd_immunity_met'] = 0

   for (var i  = 0; i <= exp.length -1; i++) {
      ey = exp[i].y
      if (i > 0 && last_ey < ey) {
         console.log(i, "curve moving up", ey)
      }
      else {
         if (ey < 0 && curve_end == 0 && i > 5) {
            curve_end = i
            console.log(i, "curve ended.", )
         }
      if (ey > 0) {
         curve_total_cases += ey      
      }
        
      }
      forecast_result['exp']['total_cases'] = curve_total_cases 
      forecast_result['exp']['total_dead'] = curve_total_cases * mortality
      forecast_result['exp']['death_percent'] =  ((curve_total_cases * mortality)/ state_pop) * 100
      forecast_result['exp']['total_infected'] = curve_total_cases * phantom
      forecast_result['exp']['infected_percent'] = ((curve_total_cases * phantom) / state_pop) * 100
      if (forecast_result['exp']['death_percent'] + forecast_result['exp']['infected_percent'] >= 80 && final_status14 == 0) {
         forecast_result['exp']['herd_immunity_met'] = i
      }


      
      exp_ys.push(ey)
      last_ey = ey
   }

   forecast_result['exp']['zero_day_met'] = curve_end
   forecast_result['exp']['total_cases'] = curve_total_cases

   forecast_result['exp']['total_not_infected'] = state_pop - forecast_result['exp']['total_infected'] - forecast_result['exp']['total_dead']
   forecast_result['exp']['niperc'] = (forecast_result['exp']['total_not_infected'] / state_pop) * 100

  

   fxs_14 = []
   fxs_7 = []
   fxs_3 = []
   fxs_exp = []

   fys_14 = []
   fys_7 = []
   fys_3 = []
   fys_exp = []

   // run out 14 day traj
   final_status = 0 
   zero_day_met = 0
   herd_met = 0
   i = 0
   
   total_cases_14 = total_cases
   total_cases_7 = total_cases
   total_cases_3 = total_cases
   total_cases_exp = total_cases


   forecast_result['14_day']['zero_day_met'] = 0
   forecast_result['7_day']['zero_day_met'] = 0
   forecast_result['3_day']['zero_day_met'] = 0

   // run forecast for 14 day traj
   final_status14 = 0
   final_status7 = 0
   final_status3 = 0
   forecast_result['14_day']['herd_immunity_met'] = 0
   forecast_result['7_day']['herd_immunity_met'] = 0
   forecast_result['3_day']['herd_immunity_met'] = 0
   while(final_status14 == 0 || final_status7 == 0 || final_status3 == 0) {
      TX = current_zero_day + i
      PY14 = lx_14['slope'] * TX + lx_14['intercept']
      PY7 = lx_7['slope'] * TX + lx_7['intercept']
      PY3 = lx_3['slope'] * TX + lx_3['intercept']
      if (PY14 > 0 && final_status14 == 0) {
         total_cases_14 += PY14
      }
      if (PY7 > 0) {
      total_cases_7 += PY7
      }
      if (PY3 > 0) {
      total_cases_3 += PY3
      }

      if (PY14 <= 0 && forecast_result['14_day']['zero_day_met'] == 0) {
         forecast_result['14_day']['zero_day_met'] = TX
         final_status14 = 1
      }
      if (PY7 <= 0 && forecast_result['7_day']['zero_day_met'] == 0) {
         forecast_result['7_day']['zero_day_met'] = TX
         final_status7 = 1
      }
      if (PY3 <= 0 && forecast_result['3_day']['zero_day_met'] == 0) {
         forecast_result['3_day']['zero_day_met'] = TX
         final_status3 = 1
      }
      if (final_status14 != 1) {
         forecast_result['14_day']['total_cases'] = total_cases_14 
         forecast_result['14_day']['total_dead'] = total_cases_14 * mortality 
         forecast_result['14_day']['death_percent'] =  ((total_cases_14 * mortality)/ state_pop) * 100
         forecast_result['14_day']['total_infected'] = total_cases_14 * phantom
         forecast_result['14_day']['infected_percent'] = ((total_cases_14 * phantom) / state_pop) * 100
      }

      forecast_result['7_day']['total_cases'] = total_cases_7
      forecast_result['7_day']['total_dead'] = total_cases_7 * mortality 
      forecast_result['7_day']['death_percent'] =  ((total_cases_7 * mortality)/ state_pop) * 100
      forecast_result['7_day']['total_infected'] = total_cases_7 * phantom
      forecast_result['7_day']['infected_percent'] = ((total_cases_7 * phantom) / state_pop) * 100

      forecast_result['3_day']['total_cases'] = total_cases_3
      forecast_result['3_day']['total_dead'] = total_cases_3 * mortality 
      forecast_result['3_day']['death_percent'] =  ((total_cases_3 * mortality)/ state_pop) * 100
      forecast_result['3_day']['total_infected'] = total_cases_3 * phantom
      forecast_result['3_day']['infected_percent'] = ((total_cases_3 * phantom) / state_pop) * 100

      impacted_14 = (forecast_result['14_day']['total_cases'] + forecast_result['14_day']['total_dead'] + forecast_result['14_day']['total_infected']) / state_pop

      //if (forecast_result['14_day']['death_percent'] + forecast_result['14_day']['infected_percent'] >= 80 && final_status14 == 0) {
      if (impacted_14 > .8 && final_status14 == 0) {
         final_status14 = 1
         forecast_result['14_day']['herd_immunity_met'] = TX
      }

      if (forecast_result['7_day']['death_percent'] + forecast_result['7_day']['infected_percent'] >= 80 && final_status7 == 0) {
         final_status7 = 1
         forecast_result['7_day']['herd_immunity_met'] = TX
      }

      if (forecast_result['3_day']['death_percent'] + forecast_result['3_day']['infected_percent'] >= 80 && final_status3 == 0) {
         final_status3 = 1
         forecast_result['3_day']['herd_immunity_met'] = TX
      }

      i = i + 1
      if (i > 3000) {
         final_status7 = 1
         final_status14 = 1
         final_status3 = 1
      }

   }

   forecast_result['14_day']['total_not_infected'] = state_pop - forecast_result['14_day']['total_infected'] - forecast_result['14_day']['total_dead'] - forecast_result['14_day']['total_cases']
   forecast_result['14_day']['niperc'] = (forecast_result['14_day']['total_not_infected'] / state_pop) * 100
   forecast_result['7_day']['total_not_infected'] = state_pop - forecast_result['7_day']['total_infected'] - forecast_result['7_day']['total_dead']
   forecast_result['7_day']['niperc'] = (forecast_result['7_day']['total_not_infected'] / state_pop) * 100
   forecast_result['3_day']['total_not_infected'] = state_pop - forecast_result['3_day']['total_infected'] - forecast_result['3_day']['total_dead']
   forecast_result['3_day']['niperc'] = (forecast_result['3_day']['total_not_infected'] / state_pop) * 100




   return(forecast_result)

}

function makeGraph(xs_in,ys_in,title,xlab,ylab,div_id,fit_days,proj_days) {
   var local_xs = xs_in.slice(0)
   var local_ys = ys_in.slice(0)
   var out = ""
   // Make fit lines
   // 14 days
   var local_ys2 = []
   // 7 days
   var local_ys3 = []
   // 3 days
   var local_ys4 = []

   // curve fit

   var rdata = []
   for (var i  = 0; i <= local_xs.length -1; i++) {
      var point = [local_xs[i], local_ys[i]]
      rdata.push(point)
      var last_x = local_xs[i]
   }
   
   var linReg = regression('polynomial', rdata);
   var linRegEq = "Lin: y = " + linReg.equation[0].toFixed(4) + "x + " + linReg.equation[1].toFixed(2) + ", r2 = " + linReg.r2.toFixed(3);
   var tx = 0
   for (var i = 0; i<= 60; i++) {
      tx = last_x + i
      point = [tx, local_ys[i]]
      rdata.push(point)

   }
   
   var exp = extraPoints(rdata,linReg)

   var local_exp_ys = []
   var ey = 0
   for (var i  = 0; i <= exp.length -1; i++) {
      ey = exp[i].y
      local_exp_ys.push(ey)
   } 

   // 14 DAY FIT
   var lr_xs = local_xs.slice(Math.max(local_xs.length - fit_days, 1))
   var lr_ys = local_ys.slice(Math.max(local_ys.length - fit_days, 1))
   var lx_14 = linearRegression(lr_xs,lr_ys)

   // 7 DAY FIT
   var lr_xs = local_xs.slice(Math.max(local_xs.length - 7 , 1))
   var lr_ys = local_ys.slice(Math.max(local_ys.length - 7, 1))
   var lx_7 = linearRegression(lr_xs,lr_ys)

   var lr_xs = local_xs.slice(Math.max(local_xs.length - 3 , 1))
   var lr_ys = local_ys.slice(Math.max(local_ys.length - 3, 1))
   var lx_3 = linearRegression(lr_xs,lr_ys)


   for (var i  = 0; i <= local_xs.length -1; i++) {
      var X = local_xs[i]
      var Y = local_ys[i]
      if (local_xs.length - 14 < i + 1) {
         var PY14 = lx_14['slope'] * X + lx_14['intercept'] 
      }
      else {
         var PY14 = 0
      }
      if (local_xs.length - 7 < i + 1) {
         var PY7 = lx_7['slope'] * X + lx_7['intercept'] 
      }
      else {
         var PY7 = 0
      }
      if (local_xs.length - 3 < i + 1) {
         var PY3 = lx_3['slope'] * X + lx_3['intercept'] 
      }
      else {
         var PY3 = 0
      }
      if (PY14 < 0) {
         var PY14 = 0
      }
      if (PY7 < 0) {
         var PY7 = 0
      }
      if (PY3 < 0) {
         var PY3 = 0
      }
      local_ys2.push(PY14)
      local_ys3.push(PY7)
      local_ys4.push(PY3)
      //out += PY.toString() + "<BR>";
   }

   last_x = X
   last_zd14_day = 9999
   last_zd7_day = 9999
   last_zd3_day = 9999
   last_exp_day = 9999

   exp_pos = 0
   for (var i = 0; i <= proj_days; i++) {
      TX = last_x + i   
      PY14 = lx_14['slope'] * TX + lx_14['intercept'] 
      PY7 = lx_7['slope'] * TX + lx_7['intercept'] 
      PY3 = lx_3['slope'] * TX + lx_3['intercept'] 
      local_xs.push(TX)
      local_ys.push(0)
      local_ys2.push(PY14)
      local_ys3.push(PY7)
      local_ys4.push(PY3)
      if (last_zd14_day == 9999 && PY14 <= 0) {
         last_zd14_day = i
      }
      if (last_zd7_day == 9999 && PY7 <= 0) {
         last_zd7_day = i
      }
      if (last_zd3_day == 9999 && PY3 <= 0) {
         last_zd3_day = i
      }
      if (last_exp_day == 9999 && local_exp_ys[i+last_x] <= 0 && exp_pos == 1) {
         last_exp_day = i
      }
      if (local_exp_ys[i+last_x] > 0) {
         exp_pos = 1
      }
      
   } 
   if (last_exp_day == 9999) {
      if (local_exp_ys.slice(-1)[0] <= 0) {
         last_exp_day = 0
      }
      
   }

   //last_zd14_val = ys2.slice(-1)[0] 
   //last_zd7_val = ys3.slice(-1)[0] 
   //last_zd3_val = ys4.slice(-1)[0] 


   out = [last_zd14_day, last_zd7_day, last_zd3_day, last_exp_day]

   plot_data(local_xs,local_ys,local_ys2,local_ys3,local_ys4,local_exp_ys, xlab,ylab,title,div_id,"bar") 

   return(out)

}

function load_data() {
   var state = $('#state_selector').val();
   var state_name = $('#state_selector option:selected').text();
   var url = "../json/" + state + ".json"
   getJSONData(url, 1)

}

function makeStateSelect(states) {
   sel = "<form><select id=\"state_selector\" onchange='load_data()' ><option value='AL'>SELECT STATE</option>"
   for (var i = 0; i < states.length; i++) {
      sel += "<option value='" + states[i].state_code + "'>" + states[i].state_name + "</option>"
   }
   sel += "</select></form>"
   document.getElementById("state_select").innerHTML= sel
}

function getJSONData(url, cb_func) {
   show_loader();	
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",
 
      success: function (result, status, xhr) {
          if (cb_func == 1) {
             doSomethingWithJsonData(result );
          }
          if (cb_func == 2) {
             makeStateSelect(result );
          }
          hide_loader();	
      },
      error: function (xhr, status, error) {
        alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        hide_loader();	
      }
   });
}


function plot_data_line(xd,yd,yd2,yd3,yd4,exp_yd,xl,yl,t,dv,type) {
   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      type: type
   }
   var trace2 = {
      x: xd,
      y: yd2,
      name: yl,
      name: "14-Day Trajectory",
      type: type  
   }
   var trace3 = {
      x: xd,
      y: yd3,
      name: yl,
      name: "7-Day Trajectory",
      type: type  
   }
   var trace4 = {
      x: xd,
      y: yd4,
      name: yl,
      name: "3-Day Trajectory",
      type: type  
   }
   var trace5 = {
      x: xd,
      y: exp_yd,
      name: yl,
      name: "Curve",
      type: type  
   }
   var data = [trace1 , trace2, trace3,trace4,trace5]
   var layout = {
      title : t,
      yaxis : {
         title: {
            text: yl
         },
         autorange: true,
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 4,
         tickcolor: '#000'
      },
      xaxis : {
         title: {
            text: xl
         },
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 4,
         tickcolor: '#000'

      }
   }

   Plotly.newPlot(dv, data, layout, {responsive: true});

}

function plot_data(xd,yd,yd2,yd3,yd4,exp_y,xl,yl,t,dv,type) {

   ymax = Math.max.apply(Math, yd)
   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      type: type
   }
   var trace2 = {
      x: xd,
      y: yd2,
      name: "14 Day Traj",
      type: "line" 
   }
   var trace3 = {
      x: xd,
      y: yd3,
      name: "7 Day Traj",
      type: "line" 
   }
   var trace4 = {
      x: xd,
      y: yd4,
      name: "3 Day Traj",
      type: "line" 
   }
   var trace5 = {
      x: xd,
      y: exp_y,
      name: "Curve",
      type: "line" 
   }
   var data = [trace1, trace2, trace3,trace4,trace5]
   var config = {responsive: true}
 

   var layout = {
      title : t,
      yaxis : {
         title: {
            text: yl
         },
         range: [0,ymax],
         autorange: false,
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 4,
         tickcolor: '#000'
      }, 
      xaxis : {
         title: {
            text: xl
         },
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 4,
         tickcolor: '#000'

      } 
   }
   Plotly.newPlot(dv, data, layout, {responsive: true});
}

