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

function doSomethingWithJsonData(json_data, div_id) {
   out = ""
   state_name = json_data['summary_info'].state_name
   ss = json_data['state_stats']

   var date_vals = []
   var zero_day_vals = []
   var total_cases_vals = []
   var new_cases_vals = []
   var deaths_vals = []
   var case_growth_vals = []
   var death_growth_vals = []

   zd = 0
   ss.forEach(function (arrayItem) {
      date_vals.push(arrayItem.date);
      zero_day_vals.push(zd);
      total_cases_vals.push(arrayItem.cases);
      new_cases_vals.push(arrayItem.new_cases);
      deaths_vals.push(arrayItem.deaths);
      case_growth_vals.push(arrayItem.cg_last);
      death_growth_vals.push(arrayItem.dg_last);
      zd = zd + 1
      last_date = arrayItem.date
   });
   title = state_name.toUpperCase() + " NEW CASES " + last_date
   fit_days = 14
   out = makeGraph(zero_day_vals, new_cases_vals,title, "zero day", "new cases", "new_cases_div", fit_days, 60)
   document.getElementById("results_panel").innerHTML= out

}

function makeGraph(xs,ys,title,xlab,ylab,div_id,fit_days,proj_days) {

   out = ""
   // Make fit lines
   // 14 days
   ys2 = []
   // 7 days
   ys3 = []
   // 3 days
   ys4 = []

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
      ys2.push(PY14)
      ys3.push(PY7)
      ys4.push(PY3)
      //out += PY.toString() + "<BR>";
   }

   last_x = X

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
   } 



   plot_data(xs,ys,ys2,ys3,ys4, xlab,ylab,title,div_id,"bar") 

   return(out)

}

function getJSONData(url, div_id) {
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",
      success: function (result, status, xhr) {
          doSomethingWithJsonData(result, div_id);
      },
      error: function (xhr, status, error) {
        alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
      }
   });
}

function plot_data(xd,yd,yd2,yd3,yd4,xl,yl,t,dv,type) {
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
   var data = [trace1, trace2, trace3,trace4]
   var config = {responsive: true}

   var layout = {
      title : t
   }
   alert(dv)
   Plotly.newPlot(dv, data, layout, {responsive: true});
}

