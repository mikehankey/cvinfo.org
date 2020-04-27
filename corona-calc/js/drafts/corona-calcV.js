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

   /**
    * Update Gauges
    */
   console.log("TYPE",type);

   var $gaugesCont = $('#'+type.replace(/\s/g, '')+"_cont"); 
   var $forteen_days = $gaugesCont.find('.14days');
   var $seven_days = $gaugesCont.find('.7days');
   var $three_days = $gaugesCont.find('.3days');
   var $new =  $gaugesCont.find('.new'); 
   
   renewSvg();

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
 
    
   out = ""
   if (pred[0] == 9999) {
      out += "<li class='bad'>Based on the " + type + " 14 day trajectory, " + state_name + " will not reach a zero day. "
   }
   else {
      out += "<li class='good'>Based on the " + type + " 14 day trajectory, " + state_name + " will reach the zero day in " + pred[0].toString() + " more days."
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
   
   // Anim gauges
   out = ""; // No more text
   setTimeout(function(){ 
       start_gauges($gaugesCont);
   },2500);
 
   

   return out;
}

function doSomethingWithJsonData(json_data ) {
   out = ""
   state_name = json_data['summary_info'].state_name
   ss = json_data['state_stats']

   var date_vals = []
   var zero_day_vals = []
   var total_cases_vals = []
   var new_cases_vals = []
   var new_deaths_vals = []
   var case_growth_vals = []
   var death_growth_vals = []
   var decay_vals = []

   zd = 0
   last_growth = 0
   ss.forEach(function (arrayItem) {
      date_vals.push(arrayItem.date);
      zero_day_vals.push(zd);
      total_cases_vals.push(arrayItem.cases);
      new_cases_vals.push(arrayItem.new_cases);
      new_deaths_vals.push(arrayItem.new_deaths);
      case_growth_vals.push(arrayItem.cg_last);
      death_growth_vals.push(arrayItem.dg_last);
      zd = zd + 1
      last_date = arrayItem.date
      decay = arrayItem.cg_last - last_growth
      decay_vals.push(decay);
      last_growth = arrayItem.cg_last 
   });

   title = state_name.toUpperCase() + " NEW CASES " + last_date
   fit_days = 14
   zdv = zero_day_vals.slice();
   zdv2 = zero_day_vals.slice();
   zdv3 = zero_day_vals.slice();
   zdv4 = zero_day_vals.slice();
   pred = makeGraph(zero_day_vals, new_cases_vals,title, "zero day", "new cases", "new_cases_div", fit_days, 60)
   out = forecast_html(pred, "new case ", state_name, )



   document.getElementById("new_cases_forecast").innerHTML= out

   title = state_name.toUpperCase() + " GROWTH " + last_date
   pred = makeGraph(zdv, case_growth_vals,title, "zero day", "growth", "growth_div", fit_days, 60)
   out = forecast_html(pred, "growth", state_name, )
   document.getElementById("growth_forecast").innerHTML= out

   title = state_name.toUpperCase() + " NEW DEATHS " + last_date
   out2 = makeGraph(zdv2, new_deaths_vals,title, "zero day", "new deaths", "new_deaths_div", fit_days, 60)
   //document.getElementById("results_panel").innerHTML= out

   title = state_name.toUpperCase() + " DEATH GROWTH " + last_date
   out2 = makeGraph(zdv3, death_growth_vals,title, "zero day", "death growth", "deaths_growth_div", fit_days, 60)

   title = state_name.toUpperCase() + " GROWTH DECAY " + last_date


   fitsObj = getFits(zdv4, decay_vals)
 
   out2 = plot_data_line(zdv4, decay_vals,fitsObj.yd2, fitsObj.yd3, fitsObj.yd4, fitsObj.exp_yd, "zero day", "growth decay", title, "decay_div", "line")

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
   //console.log(ys2)
   //console.log(ys3)
   //console.log(ys4)
   //console.log(exp_ys)
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

function makeGraph(xs_in,ys_in,title,xlab,ylab,div_id,fit_days,proj_days) {
   var xs = xs_in
   var ys = ys_in
   var out = ""
   // Make fit lines
   // 14 days
   var ys2 = []
   // 7 days
   var ys3 = []
   // 3 days
   var ys4 = []

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
   lr_xs = xs.slice(Math.max(xs.length - fit_days, 1))
   lr_ys = ys.slice(Math.max(ys.length - fit_days, 1))
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
   if (last_exp_day == 9999) {
      if (exp_ys.slice(-1)[0] <= 0) {
         last_exp_day = 0
      }
      
   }

   //last_zd14_val = ys2.slice(-1)[0] 
   //last_zd7_val = ys3.slice(-1)[0] 
   //last_zd3_val = ys4.slice(-1)[0] 


   out = [last_zd14_day, last_zd7_day, last_zd3_day, last_exp_day]

   plot_data(xs,ys,ys2,ys3,ys4,exp_ys, xlab,ylab,title,div_id,"bar") 

   return(out)

}
 




function plot_data_line(xd,yd,yd2,yd3,yd4,exp_yd,xl,yl,t,dv,type) {
   //console.log("YD2:")
   //console.log(yd2)
   //console.log("YD3:")
   //console.log(yd3)
   //console.log("YD4:")
   //console.log(yd4)
   //console.log("EXPY:")
   //console.log(exp_yd)
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
      name: "14 Day Traj",
      type: type  
   }
   var trace3 = {
      x: xd,
      y: yd3,
      name: yl,
      name: "7 Day Traj",
      type: type  
   }
   var trace4 = {
      x: xd,
      y: yd4,
      name: yl,
      name: "3 Day Traj",
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

