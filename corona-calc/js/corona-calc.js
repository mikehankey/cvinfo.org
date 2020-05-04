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




function displayData(json_data ,state,county) {

   // make hidden divs visible
   // hack because i could not figure out how to hide / show the new divs I added.  
   ctype = "state"

   var out = "";
   var state_name = json_data['summary_info'].state_name;
   var state_code = json_data['summary_info'].state_code; 
   var state_total_cases = json_data['summary_info'].cases; 
   var sum_info = json_data['summary_info'];

   if (typeof(county) === 'undefined') {
   
      var county_list = {}
      p = json_data['county_stats'] 
      for (var key in p) {
         if (p.hasOwnProperty(key)) {
            tc = p[key]['county_stats']
            ccc = tc[tc.length-1].cases
            county_list[key] = ccc
            //county_pop[key]
         }
      }
 
      countySelect(county_list, state_code) 
      county = "ALL"
   }
 

   var state_name = json_data['summary_info'].state_name;
   
   // Use the value in the FORM instead
   //var mortality = json_data['summary_info'].mortality / 100;



   var cg_med = json_data['summary_info'].cg_med;
   var cg_med_decay = json_data['summary_info'].cg_med_decay;

   if (typeof(county) == "undefined" || county == "ALL") {
      var state_pop = json_data['summary_info'].state_population * 1000000;
      var ss = json_data['state_stats'];
      full_state_name = state_name
   }  else { 
      state_pop = json_data['county_pop'][county]
      var ss = json_data['county_stats'][county]['county_stats'];
      if (county.toLowerCase().indexOf("city") === -1) {
         full_state_name = county + " County, " + state_code
      }
      else {
         full_state_name = county + ", " + state_code
      }
      //state_name = full_state_name
      ctype = "county"
   }

   var date_vals = [];
   var zero_day_vals = [];
   var total_cases_vals = [];
   var new_cases_vals = [];
   var new_deaths_vals = [];
   var case_growth_vals = [];
   var death_growth_vals = [];
   var decay_vals = [];
   var test_vals = [];
   var mortality_vals = [];

   var zd = 0;
   var last_growth = 0;

   // Prepare all data
   var last_tests = 0;
   
   var last_county_mortality = 0;

   ss.forEach(function (arrayItem) {
      if (typeof(arrayItem.date) != "undefined") {
         date_vals.push(arrayItem.date);
         this_date = arrayItem.date
         test_pd = arrayItem.tests - last_tests
         test_vals.push(test_pd)
         last_tests = arrayItem.tests
      }
      else {
         // county record here
         date_vals.push(arrayItem.day.replace(/-/g,""));
         this_date = arrayItem.day.replace(/-/g,"") 
      }
      zero_day_vals.push(zd);
      total_cases_vals.push(arrayItem.cases);
      last_cases = arrayItem.cases
      last_deaths = arrayItem.deaths
      new_cases_vals.push(arrayItem.new_cases);
      new_deaths_vals.push(arrayItem.new_deaths);

      if (typeof(arrayItem.cg_last) != "undefined") {
         case_growth_vals.push(arrayItem.cg_last);
         death_growth_vals.push(arrayItem.dg_last);
         decay = arrayItem.cg_last - last_growth
         last_growth = arrayItem.cg_last 
      } else {
         case_growth_vals.push(arrayItem.case_growth);
         death_growth_vals.push(arrayItem.death_growth);
         decay = arrayItem.case_growth - last_growth
         last_growth = arrayItem.case_growth
      }

      mortality_vals.push(arrayItem.mortality);
      zd = zd + 1
      last_date = this_date 
      decay_vals.push(decay);
      last_county_mortality = arrayItem.mortality;
   });

   
   // We take the last county mortality into account note that for the state, it's the same
    var mortality = last_county_mortality/100;
   $("#init_mortality").val(mortality); 

   // If the user entered another value, we take it into account instead
   if($('#calc_mortality').val() !== "" && parseFloat($('#calc_mortality').val())!==0) { 
      mortality = parseFloat($('#calc_mortality').val()/100);  
   }
   
   $('#calc_mortality').val((mortality*100).toFixed(2));
   
   
   // make some JS dates
   js_dates = convert_zero_day_to_date(total_cases_vals, date_vals)
   // important dates are
   // first case date for area being examined
   // national lock down date 
   // reopen protests dates
   // other important / interesting dates
   // these dates will be marked with a line on the graph
   // so we can see the impact of events on data

   nc_org = new_cases_vals.slice();
   nc_org2 = new_cases_vals.slice();
   zdv = zero_day_vals.slice();

   fit_days = 14;
   

   // Draw graphs & Gauges for New Cases
   // New Cases
   //  at " + dateFormat(last_date) + "
   

   zdv2 = zero_day_vals.slice();
   zdv3 = zero_day_vals.slice();
   zdv4 = zero_day_vals.slice();
   zdv5 = zero_day_vals.slice();
   zdv6 = zero_day_vals.slice();

   // Growth
   model_data = []
   title = "<b>" + full_state_name  + " - Growth</b><br> per day since first case";
   out = makeGraph(zdv, case_growth_vals,title, "days since first case", "Growth", "growth_div", fit_days, 60,[])
   

   // New Deaths
   title = "<b>" + full_state_name  + " - New Deaths</b><br>at " + dateFormat(last_date) + " in days since first case";
   pred = makeGraph(zdv2, new_deaths_vals,title, "Days since first case", "New Deaths", "new_deaths_div", fit_days, 60,[]);
   //title = "<b>" + full_state_name  + " - New Deaths</b><br> per day since first case";
   //pred = makeGraph(zdv2, new_deaths_vals,title, "Days since first case", "New CaDeathsses", "new_deaths_div", fit_days, 60,[]);

   // Death Growth
   title = "<b>" + full_state_name  + " - Death Growth</b><br> per day since first case";
   out2 = makeGraph(zdv3, death_growth_vals,title, "Days since first case", "Death Growth", "deaths_growth_div", fit_days, 60,[])

   // Growth Decay
   title = "<b>" + full_state_name  + " - Growth Decay</b><br> per day since first case";
   fitsObj = getFits(zdv4, decay_vals)
   out2 = plot_data_line(zdv4, decay_vals,fitsObj['ys2'], fitsObj.ys3, fitsObj.ys4, fitsObj.exp_ys, "Days since first case", "Growth Decay", title, "decay_div", "line")

   // Tests
   if (ctype == 'state') {
      title = "<b>" + full_state_name  + " - Tests per day</b>";
      out2 = makeGraph(zdv2, test_vals ,title, "Days since first case", "Tests per day", "test_div", fit_days, 60,model_data)
   }

   // mortality div
   fitsObj = getFits(zdv5, mortality_vals)
   title = "<b>" + full_state_name  + " - Mortality</b><br>at " + dateFormat(last_date) + " in days since first case"; 
   out2 = plot_data_line(zdv5, mortality_vals,fitsObj['ys2'], fitsObj.ys3, fitsObj.ys4, fitsObj.exp_ys, "Days since first case", "Mortality Percentage", title, "mortality_div", "line")

   var total_cases = new_cases_vals.reduce(function(a, b){
      return a + b;
   }, 0);
   var total_deaths = new_deaths_vals.reduce(function(a, b){
      return a + b;
   }, 0);

   phantom = parseFloat(document.getElementById("calc_phantom").value )
   herd_thresh = parseFloat(document.getElementById("herd_thresh").value/100 )
   current_zero_day = nc_org2.length

   // This is the MAIN summary at the top of the page.
   MIT = json_data['model_data']['MIT']
   LA = json_data['model_data']['MIT']
   if (county != "ALL") {
      county_perc = (total_cases / state_total_cases )
   }
   else {
      county_perc = 1
   }
 
   fr = forecast(zdv6,nc_org2,total_cases,total_deaths,mortality,phantom,state_pop,current_zero_day,herd_thresh,MIT,LA,county_perc);
   if (county == "ALL") {
      total_cases = json_data['summary_info']['cases']
      total_deaths = json_data['summary_info']['deaths']
   }
   else {
      county_stats = json_data['county_stats'][county]['county_stats']
      last = county_stats.length - 1
      total_cases = county_stats[last].cases
      total_deaths= county_stats[last].deaths

   }
   //console.log("DISPLAY DATA FORECAST");
   //console.log(fr);

   document.getElementById("calc_mortality").value = (mortality*100).toFixed(2)
   document.getElementById("f_xs").value = zdv6
   document.getElementById("f_ys").value = nc_org2 
   document.getElementById("f_total_cases").value = total_cases
   document.getElementById("f_total_deaths").value = total_deaths
   document.getElementById("f_state_pop").value = state_pop 
   document.getElementById("f_current_zero_day").value = current_zero_day 
   document.getElementById("f_state_name").value = state_name
   document.getElementById("f_county").value = county;

   $('#f_mortality').val(mortality); //json_data['summary_info'].mortality );

   //console.log("MORTALITY ", mortality);
   //console.log("JSON MORT ", json_data['summary_info'].mortality);

   // See corona-ui-data.js
   sum_info['cases'] = total_cases 
   sum_info['deaths'] = total_deaths 
   sum_info['total_infected'] = total_cases * phantom
   sum_info['not_infected'] = state_pop - ((total_cases * phantom)  + total_cases + last_deaths)
   document.getElementById("f_total_infected").value = sum_info['total_infected'] 
   document.getElementById("f_not_infected").value = sum_info['not_infected'] 
   document.getElementById("f_cases").value = last_cases 
   document.getElementById("f_deaths").value = last_deaths


   // We are near the end so we're missing data
   if(typeof fr['7_day'].total_dead  == "undefined" ) {
      fr['7_day'].total_dead  = sum_info.deaths;
   }

   if(typeof fr['14_day'].total_dead  == "undefined" ) {
      fr['14_day'].total_dead  = fr['7_day'].total_dead;
   }
   
   if(typeof fr['7_day'].total_cases  == "undefined" ) {
      fr['7_day'].total_cases  = sum_info.cases;
   }

   if(typeof fr['14_day'].total_cases  == "undefined" ) {
      fr['14_day'].total_cases  = fr['7_day'].total_cases;
   }

   if(typeof fr['7_day'].total_infected  == "undefined" ) {
      fr['7_day'].total_infected  =  herd_thresh * fr['7_day'].total_cases;
   }

   if(typeof fr['14_day'].total_infected  == "undefined" ) {
      fr['14_day'].total_infected  =  herd_thresh * fr['14_day'].total_cases;
   }

   if(typeof fr['7_day'].not_infected  == "undefined" ) {
      fr['7_day'].not_infected  = state_pop - fr['7_day'].total_infected - fr['7_day'].total_cases - fr['7_day'].total_dead;
   }

   if(typeof fr['14_day'].not_infected  == "undefined" ) {
      fr['14_day'].not_infected  =  state_pop - fr['14_day'].total_infected - fr['14_day'].total_cases - fr['14_day'].total_dead;
   }
 
   // add model data to these graphs
   title = "<b>" + full_state_name  + " New Cases</b><br>per day since first case";
   pred = makeGraph(zero_day_vals, nc_org,title, "Days since first case", "New Cases", "new_cases_div", fit_days, 60,fr['MIT']['ys']);

 
   fillSummary(full_state_name,fr,sum_info);
 

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






function recalculate() {

   f_xs_str = document.getElementById("f_xs").value 
   f_ys_str = document.getElementById("f_ys").value 
   f_xs_ar = f_xs_str.split(",") 
   f_ys_ar = f_ys_str.split(",") 
   f_xs = []
   f_ys = []
   for (i =0; i< f_xs_ar.length; i++) {
   f_xs.push(parseFloat(f_xs_ar[i]))
   f_ys.push(parseFloat(f_ys_ar[i]))
   }
   herd_thresh = parseFloat(document.getElementById("herd_thresh").value/100 )

   f_total_cases = parseFloat(document.getElementById("f_total_cases").value)
   f_total_deaths = parseFloat(document.getElementById("f_total_deaths").value)
   f_mortality = parseFloat(document.getElementById("calc_mortality").value/100)
   f_phantom = parseFloat(document.getElementById("calc_phantom").value )
   f_state_pop = parseFloat(document.getElementById("f_state_pop").value)
   f_current_zero_day = parseFloat(document.getElementById("f_current_zero_day").value)
   state_name = document.getElementById("f_state_name").value
   county = document.getElementById("f_county").value

   sum_info = {} 
   sum_info['cases'] = document.getElementById("f_cases").value
   sum_info['deaths'] = document.getElementById("f_deaths").value
   sum_info['total_infected'] = document.getElementById("f_total_infected").value
   sum_info['not_infected'] = document.getElementById("f_not_infected").value

   // This is the MAIN summary at the top of the page.

   fr = forecast(f_xs,f_ys,f_total_cases,total_deaths, f_mortality,f_phantom,f_state_pop,f_current_zero_day, herd_thresh, MIT, LA, county_perc)
 
   // See corona-ui-data.js
   fillSummary(state_name,fr,sum_info);
 
   extra_data = {
   "yd2": fr['14_day'].dys,
   "yd3": fr['14_day'].iys,
   "yd4":  [],
   "exp_yd": []
   }
   extra_labels = {
   "yd": "Confirmed Cases",
   "yd2": "Deaths",
   "yd3": "Infected",
   "yd4":  "",
   "exp_yd": ""
   }
   title = "Impact Forecast for " + state_name + " based on linear projection of 14-Day Trend" 
   div_id = "forecast_bar_14"
   //plot_data_bars(fr['14_day'].xs,fr['14_day'].ys,extra_data, extra_labels,xlab,ylab,title,div_id,"bar")

   extra_data = {
   "yd2": fr['7_day'].dys,
   "yd3": fr['7_day'].iys,
   "yd4":  [],
   "exp_yd": []
   }
   extra_labels = {
   "yd": "Confirmed Cases",
   "yd2": "Deaths",
   "yd3": "Infected",
   "yd4":  "",
   "exp_yd": ""
   }
   title = "Impact Forecast for " + state_name + " based on linear projection of 7-Day Trend"
   div_id = "forecast_bar_7"
   //plot_data_bars(fr['7_day'].xs,fr['7_day'].ys,extra_data, extra_labels,xlab,ylab,title,div_id,"bar")



}



function makeGraph(xs_in,ys_in,title,xlab,ylab,div_id,fit_days,proj_days,model_data) {
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

   /*
   var lr_xs = local_xs.slice(Math.max(local_xs.length - 3 , 1))
   var lr_ys = local_ys.slice(Math.max(local_ys.length - 3, 1))
   var lx_3 = linearRegression(lr_xs,lr_ys)
   */

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
   /*
   if (local_xs.length - 3 < i + 1) {
      var PY3 = lx_3['slope'] * X + lx_3['intercept'] 
   }
   else {
      var PY3 = 0
   }
   */
   if (PY14 < 0) {
      var PY14 = 0
   }
   if (PY7 < 0) {
      var PY7 = 0
   }
   /*
   if (PY3 < 0) {
      var PY3 = 0
   }
   */
   local_ys2.push(PY14)
   local_ys3.push(PY7)
   //local_ys4.push(PY3)
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
   //PY3 = lx_3['slope'] * TX + lx_3['intercept'] 
   local_xs.push(TX)
   local_ys.push(0)
   local_ys2.push(PY14)
   local_ys3.push(PY7)
   //local_ys4.push(PY3)
   if (last_zd14_day == 9999 && PY14 <= 0) {
      last_zd14_day = i
   }
   if (last_zd7_day == 9999 && PY7 <= 0) {
      last_zd7_day = i
   }
   /*
   if (last_zd3_day == 9999 && PY3 <= 0) {
      last_zd3_day = i
   }
   */
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
   out = [last_zd14_day, last_zd7_day, last_exp_day] // , last_zd3_day

   plot_data(local_xs,local_ys,local_ys2,local_ys3,local_ys4,local_exp_ys, xlab,ylab,title,div_id,"bar",model_data) 

   return(out)

}


function load_data(reload) {
   var state = $('#state_selector').val();
   var county = $('#county_selector').val();  
   var url = "../json/" + state + ".json";
   if($.trim(state)!=='') {
      // Update Soc Sharing with Full State Name
      if(county!=='' && typeof county !== "undefined") {
         setShareLinks({state:county+", "+ state, state_code:state,county:county});
      } else {
         setShareLinks({state:$("#state_selector option[value='"+state+"']").text(), state_code:state});
      }
    
      getJSONData(url,state,county,reload);
   }
}

function change_state() { 
   $("#county_select").html("");
   $('#calc_mortality').val(""); 
   load_data();
}


function getJSONData(url,state,county,reload) {
   if(typeof reload == 'undefined') {
      show_loader();	
   }
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",

      success: function (result, status, xhr) {
         
         displayData(result,state,county);
         // Create action on county select
         $('#county_selector').unbind('change').change(function() {load_data()}); 
 
         if(init_select_county!='') {
            var possibleCounties = [];
            var possibleCountiesIndex = [];

            // Does init_select_county is in county_selector
            $('#county_selector option').each(function(i,v){
               possibleCounties.push(v.value);
               possibleCounties.push(v.value.replace(/\s/g, ''));
               possibleCounties.push(v.value.replace("'","").replace(/\s/g, ''));
               possibleCounties.push(v.value.replace("'",""));
               possibleCounties.push(v.value.replace(".",""));
               possibleCounties.push(v.value.replace(".","").replace("'",""));
               possibleCounties.push(v.value.replace(".","").replace("'","").replace(/\s/g, ''));
               possibleCountiesIndex.push(i);
               possibleCountiesIndex.push(i);
               possibleCountiesIndex.push(i);
               possibleCountiesIndex.push(i);
               possibleCountiesIndex.push(i); 
               possibleCountiesIndex.push(i);
               possibleCountiesIndex.push(i);
            })

          
            var toTest = possibleCounties.indexOf(init_select_county);
            if(toTest>0) { 
               // Select County
               var $opt = $('#county_selector option').get(possibleCountiesIndex[toTest]);
               $('#county_selector').val($($opt).attr('value')).trigger('change');
            }
            possibleCounties = null;
            init_select_county = "";
         }
          

         if(typeof reload  == 'undefined') {
            hide_loader();	 
         } else { 
            $('#recalculate').html($('#recalculate').attr('data-htmlx'));
            $('#recalculate').removeAttr('data-htmlx');
            $('body').removeClass('wait');
         }
      },
      error: function (xhr, status, error) {
         alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         hide_loader();	
      }
   });
}


function plot_data_bars(xd,yd,extra_d,extra_l,xl,yl,t,dv,type, model_ys) {
    var trace1 = {
      x: xd,
      y: yd,
      name: extra_l.yd,
      type: type
   };

   var trace2 = {
      x: xd,
      y: extra_data.yd2,
      name: yl,
      name: extra_l.yd2,
      type: type
   };

   var trace3 = {
      x: xd,
      y: extra_data.yd3,
      name: yl,
      name: extra_l.yd3,
      type: type
   };

   var trace4 = {
      x: xd,
      y: extra_data.yd4,
      name: yl,
      name: "3-Day Trend",
      type: type
   };

   var trace5 = {
      x: xd,
      y: extra_data.exp_yd,
      name: yl,
      name: "Curve",
      type: type
   };

   var trace6 = {
      x: xd,
      y: model_ys,
      name: yl,
      name: "MIT Model (entire state)",
      type: "line" 
   };

   var data = [trace1 , trace2, trace3,trace4,trace5,trace6];

   var layout = {
      barmode: 'stack',
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

   Plotly.newPlot(dv, data, layout, {responsive: true, displayModeBar: false});


}



