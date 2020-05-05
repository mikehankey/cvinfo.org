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
      margin: {"t": 80, "b": 80, "l": 80, "r": 50},
      showlegend: true,
      legend: {
         orientation: "h" 
      },
   };
   Plotly.newPlot(dv, data, layout, {responsive: true});
} 
