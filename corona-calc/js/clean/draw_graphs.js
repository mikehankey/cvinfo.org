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

   var all_models_data_sets = [];
   var maxModelDateArray = []; // If we have models, what is the max date?
   var maxDayModel = new Date(1979,01,01);
   var all_models_colors = ['rgba(31,119,180,.8)','rgba(31,180,177,.8)','rgba(180,31,66,.8)','rgba(199,120,60,.8)']
   var modelData;

   // Do we have models?
   if(data.models !== undefined && data.models.length>0) {
      $.each(data.models,function(i, model) {

         modelData = {
            name: model.model + " model",
            x: model.x_axis,
            y: model.y_axis, 
            type: "line",
            mode: "lines",
            xaxis: 'x2'
         };

         if(all_models_colors[i] !== undefined) {
            modelData.line = {color: all_models_colors[i]};
         }

         all_models_data_sets.push(modelData); 
         
         maxModelDateArray.push(new Date(Math.max.apply(null,model.x_axis)));
      });
   }

   maxDayModel = new Date(Math.max.apply(null,maxModelDateArray));
 
    
   var maxDate1, minDate1, maxDate2, minDate2, min, max;
   var dataSet1,dataSet2,dataSet3,dataSet4,dataSet5;
 
   // Get Range for X AXIS
   maxDate1 = new Date(Math.max.apply(null,data.x1));
   minDate1 = new Date(Math.min.apply(null,data.x1));
   
   if(data.models !== undefined) {
      // We have models 
      max = (maxDate1<maxDayModel)?maxDayModel:maxDate1;
      min = (minDate1<=maxDayModel)?minDate1:maxDayModel;
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

   if(data.models !== undefined) {
      // With Model
      
      all_set = [dataSet1,dataSet3,dataSet4,dataSet5];
      all_set = all_set.concat(all_models_data_sets);
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
      margin: {"t": 10, "b": 80, "l": 50, "r": 10},
      showlegend: true,
      legend: { orientation: "h" },
      barmode: 'stack', 
      yaxis: {
         tickformat: '%',
         range: [0,1],
         tickmode: "linear",
         tick0: 0,
         dtick: .1

      },
      annotations: [ {
           x: data.x1[parseInt((data.x1.length-1)/2)] ,
           y: data.threshold + .01 ,
           xref: 'x',
           yref: 'y',
           text: 'Herd Immunity Threshold: ' + data.threshold*100  + '%',
           arrowhead: 0,
           arrowsize: 0,
           arrowwidth: 0,
           borderwidth:0,
           borderpad:0,
           align: 'center'
         }
       ],
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