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

 /**
 * Draw standard graph with 7,14 trends and eventual
 * @param {*} data 
 */
function draw_graph(data,option) {
   var maxDate1, minDate1, maxDate2, minDate2, min, max;
   var dataSet1,dataSet2,dataSet3,dataSet4,dataSet5;
 
   // Get Range for X AXIS
   maxDate1 = new Date(Math.max.apply(null,data.x1));
   minDate1 = new Date(Math.min.apply(null,data.x1));
   
   if(data.x2 !== undefined) {
      // We have models
      maxDate2=new Date(Math.max.apply(null,data.x2));
      minDate2=new Date(Math.min.apply(null,data.x2)); 
      max = (maxDate1<maxDate2)?maxDate2:maxDate1;
      min = (minDate1<minDate2)?minDate1:minDate2;
   } else {
      // We don't have models
      // We take max in data.x3 (one of the Trend)
      max = new Date(Math.max.apply(null,data.x3));
      min = new Date(Math.min.apply(null,data.x1));
   }
    
   // MAX for Y AXIS
   var maxY = 1.25*( Math.max.apply(null,data.y1));

   // The dashed line will appear at dateSet max date + 1
   var curDay = maxDate1;
   curDay.setDate(curDay.getDate() + 1); 
 
   // Org Data
   dataSet1 = {
      x: data.x1,
      y: data.y1,
      name: data.title1,
      type: "bar",
      marker: {  color: 'rgb(31,119,180)'    }
   };
 

   // Typically for Growth Decay
   if(option.type !== "bars") {
      dataSet1.type = "scatter";
      dataSet1.mode =  'lines';
      dataSet1.line =  {shape: 'spline'};
   }

   // MIT Prevision
   if(data.x2 !== undefined) {
      dataSet2 = {
         x: data.x2,
         y: data.y2,
         name: data.title2,
         type: "bar",
         xaxis: 'x2',
         marker: {  color: 'rgb(158,202,225)'  }
      };  
   }

   // Linear Trend 1
   dataSet3 = {
         x: data.x3,
         y: data.y3,
         name: data.title3,
         type: "line",
         mode: 'lines',
         xaxis: 'x2',
         line: {
            color: 'rgba(255,127,14,.8)' 
         }
   };  

   // Linear Trend 2
   dataSet4 = {
         x: data.x4,
         y: data.y4,
         name: data.title4,
         type: "line", 
         mode: 'lines',
         xaxis: 'x2',
         line: {
            color: 'rgba(44,160,44,.8)',
         }
   };  


   // Curve
   dataSet5 = {
      x: data.x5,
      y: data.y5,
      name: data.title5,
      type: "line",
      xaxis: 'x2',
      line: {
         color: 'rgba(169,25,147,.8)',
      }
   };  

   var layout = { 
      xaxis: {   range: [min,max]   },
      xaxis2: {
        overlaying: 'x',
        range: [min,max]
      },
      yaxis: { range:[0,maxY] }, 
      margin: {"t": 20, "b": 80, "l": 50, "r": 10},
      showlegend: true,
      legend: { orientation: "h" },
      // Dashed grey line
      shapes : [{ 
         type: 'line',
         x0: curDay,
         y0: 0,
         x1: curDay,
         yref: 'paper',
         y1: 1,
         line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot'
         }
      }]
   };

   // Specific option for y values < 0
   // Typically for Growth Decay 
   if(option.type !== "bar") {
      layout.yaxis.range = [Math.min.apply(null,data.y1), Math.max.apply(null,data.y1)];
   }

   if(data.x2 !== undefined) {
      // With Model
      all_set = [dataSet1,dataSet2,dataSet3,dataSet4,dataSet5];
   } else { 
      // Without Model
      all_set =  [dataSet1, dataSet3,dataSet4,dataSet5];
   }

   Plotly.newPlot(data.el, all_set, layout);
   
   // Add more info 
   $('#'+data.el_title).html("<h3>"+data.title +"</h3>" + data.add_info);

}








/**
 * Draw standard graph for herd
 * @param {*} data 
 */
function draw_graph_herd(data ) {
   var all_set = [];

   // MAX for Y AXIS
   var maxY = 1.25*( Math.max.apply(null,data.y1));
 
  
   dataSet1 = {
      x: data.x1,
      y: data.y1,
      type: "bar", 
      name: data.title1
   };

   dataSet2 = {
      x: data.x2,
      y: data.y2,
      type: "bar",
      name: data.title2
   };

   dataSet3 = {
      x: data.x3,
      y: data.y3,
      type: "bar",
      name: data.title3
   };
  
   var layout = { 
      margin: {"t": 80, "b": 80, "l": 50, "r": 10},
      showlegend: true,
      legend: { orientation: "h" },
      barmode: 'stack',
      title: data.title,
      yaxis: {
         tickformat: '%',
         range: [0,1]
      },
      shapes : [{ 
         type: 'line',
         x0: data.x1[0],
         y0: data.threshold,
         x1: data.x1[data.x1.length-1],
         yref: 'paper',
         y1:  data.threshold,
         line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot'
         }
      }]
   }; 

   all_set = [dataSet1, dataSet2, dataSet3];

   Plotly.newPlot(data.el, all_set, layout);
   
   // Add more info 
   $('#'+data.el_title).html("<h3>"+data.title +"</h3>");

}