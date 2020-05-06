/**
 * Create Pies
 * @param {*} xd 
 * @param {*} lb 
 * @param {*} title 
 * @param {*} dv 
 */
function plot_pie(xd,lb,title,dv) {

   // Add Title as DOM element
   if($('#'+dv).parent().find('h3').length==0) {
      $('#'+dv).parent().prepend('<h3>'+title+'</h3>');
   }
  
   var colors =  [  '#eaeaea',  '#e5ac9d',  '#d35e60',  '#cc0000'   ];
   
   // cases, infected, not infected deaths
   var data = [{
      labels: lb,
      values: xd,
      type: 'pie',
      textinfo: "percent", // label+
      textposition: "inside",
      automargin: true,
      marker: {
         colors: colors
      }
   }];

   var layout = { 
      margin: {"t": 0, "b": 20, "l": 0, "r": 0},
      showlegend: false
   };
   Plotly.newPlot(dv, data,layout,{responsive: true, displayModeBar: false});
   
   // Create Legend
   var lg="<ul>";
   $.each(lb,function(i,v) {
      lg+= "<li><span style='background-color:"+colors[i]+"'></span> " + lb[i] + " - " + usFormat(parseInt(xd[i])) + "</li>";
   });
   lg+="</ul>";
   
   $('#'+dv).closest('.pie_chart').find('.leg').html(lg);
} 


/***
 * Update Main Gauges
 */
function updateGauges(fr) {
   var $gaugesCont = $('#forecast'); 
   var $forteen_days = $gaugesCont.find('.14days');
   var $seven_days = $gaugesCont.find('.7days');    

   // Recreate the Gauges
   createSvg(); // Issue with plotlyjs?

   if (fr['14_day'].outcome == 'zero') {
      $forteen_days.update_gauge(fr['14_day'].zero_day_met/100,'Zero Cases in','good');
   }
   else {
      if (fr['14_day'].outcome == 'herd') {
         $forteen_days.update_gauge(fr['14_day'].herd_immunity_met/100,'Herd Immunity in','ugly'); 
      }
      else {
         $forteen_days.update_gauge(fr['14_day'].zero_day_met/100,'Zero day in','good'); 
      }
   }

   if (fr['7_day'].outcome == 'zero') {
      $seven_days.update_gauge(fr['7_day'].zero_day_met/100,'Zero Cases in','good');
   }   else {
      if (fr['7_day'].outcome == 'herd') {
         $seven_days.update_gauge(fr['7_day'].herd_immunity_met/100,'Herd Immunity in','ugly');
      }
      else {
         $seven_days.update_gauge(fr['7_day'].zero_day_met/100,'Zero day in','good');
      }
   }   

   // Animate Gauges
   setTimeout(function(){   start_gauges($gaugesCont); },850);
}


// Create Line Graphs (?)
function plot_data_line(xd,yd,yd2,yd3,yd4,exp_yd,xl,yl,t,dv,type) {
   var ymax = Math.max.apply(Math, yd) * 1.2;

   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      type: type
   };

   // Trends shouldn't start at 0
 
   var trace2 = {
      x: xd,
      y: yd2,
      name: yl,
      name: "14-Day Trend",
      type: type  
   };

   var trace3 = {
      x: xd,
      y: yd3,
      name: yl,
      name: "7-Day Trend",
      type: type  
   };
 

   var trace5 = {
      x: xd,
      y: exp_yd,
      name: yl,
      name: "Curve",
      type: type  
   };
   var data = [trace1,trace2,trace3,trace5]; // , trace4
   var layout = { 
      range: [0,ymax],
      autorange: false, 
      yaxis : { 
         autorange: true,
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000',
      },
      xaxis : { 
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000'
      },
      title :  t,
      margin: {"t": 80, "b": 80, "l": 80, "r": 80},
      showlegend: true,
      legend: {
         orientation: "h" 
      }
   }

   if(dv=="mortality_div") {
      // We hide below 0 (?)
      layout.yaxis.rangemode = 'tozero';  
   }

   Plotly.newPlot(dv, data, layout, {responsive: true});

}



// Create real graphs
function plot_data(xd,yd,yd2,yd3,yd4,exp_y,xl,yl,t,dv,type,model_ys) {
  
   var ymax = Math.max.apply(Math, yd) + Math.max.apply(Math, yd)/8;
    
   for (var i = 0; i <= xd.length-1; i++) {
      if (yd[i] > 0) {
         cur_day = xd[i]
      }
   }

   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      type: type
   };

 

   var trace2 = {
      x: xd,
      y: yd2,
      name: "14-Day Trend",
      type: "line"
   };

   var trace3 = {
      x: xd,
      y: yd3,
      name: "7-Day Trend",
      type: "line" 
   };
    

   var trace5 = {
      x: xd,
      y: exp_y,
      name: "Curve",
      type: "line" 
   };

   if (model_ys.length > 0) {
      var mxs = xd.slice(0, model_ys.length)
      var trace6 = {
         x: xd,
         y: model_ys,
         name: "MIT Model",
         type: "line" 
      };
      var data = [trace1, trace2, trace3,trace5,trace6]; //
   }
   else {
      var data = [trace1, trace2, trace3,trace5]; //

   }

   var layout = {
      shapes : [{ 
         type: 'line',
         x0: cur_day,
         y0: 0,
         x1: cur_day,
         yref: 'paper',
         y1: 1,
         line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot'
         }
      }],
      yaxis : {
         range: [0,ymax],
         autorange: false,
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000' 
      }, 
      xaxis : { 
         autotick: true,
         ticks: 'outside',
         tick0: 0,
         dtick: 0.25,
         ticklen: 8,
         tickwidth: 1,
         tickcolor: '#000', 
      },
      title :  t,
      margin: {"t": 80, "b": 80, "l": 50, "r": 20},
      showlegend: true,
      legend: {
         orientation: "h" 
      },
   };
   Plotly.newPlot(dv, data, layout, {responsive: true});
} 


/**
 * Compute data before drawing graphs
 */
function makeGraph(xs_in,ys_in,title,xlab,ylab,div_id,fit_days,proj_days,model_data) {
 
   var local_xs = xs_in.slice(0);  
   var local_ys = ys_in.slice(0);
    
   var out = "";

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
   
   if (PY14 < 0) {
      var PY14 = 0
   }
   if (PY7 < 0) {
      var PY7 = 0
   }
   
   local_ys2.push(PY14)
   local_ys3.push(PY7)
   
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
   if (last_zd14_day == 9999 && PY14 <= 0) {
      last_zd14_day = i
   }
   if (last_zd7_day == 9999 && PY7 <= 0) {
      last_zd7_day = i
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
 
   out = [last_zd14_day, last_zd7_day, last_exp_day]  

   plot_data(local_xs,local_ys,local_ys2,local_ys3,local_ys4,local_exp_ys, xlab,ylab,title,div_id,"bar",model_data) 

   return(out)

} 