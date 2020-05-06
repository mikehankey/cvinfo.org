

function create_new_graphs(data,state,county) {
   var x_axis_date_new_cases  = []; 
   var x_axis_date_new_cases_trend  = []; 
   
   var y_axis_new_cases = [];
   var y_axis_new_cases_trend = []; // MIT Model

   var x_poly, y_poly; // Poly regression
   var x_trend_14, y_trend_14;
   var x_trend_7, y_trend_7;
   var reg;
   
   if(county == undefined || $.trim(county) == '') {
      // We deal with the state
   
      // Create X_AXIS with Dates
      $.each(data['js_vals']['dates'], function(i,day) {
         x_axis_date_new_cases.push(new Date(dateFormatMIT(day)));
      });
      y_axis_new_cases = data['js_vals']['new_cases_vals'];
 
      // MIT Model Dat for projection for 2nd data set
      $.each(data['model_data']['MIT']['Day'], function(i,day) {
         x_axis_date_new_cases_trend.push(new Date(day));
      });
    
      // MIT Model for Daily New Detected Cases
      // since we have the Total_Detected, we need to compute the diff
      $.each(data['model_data']['MIT']['Total_Detected'], function(i,total_detected) {
         if(i!==0) {
            y_axis_new_cases_trend.push(total_detected-data['model_data']['MIT']['Total_Detected'][i-1]);
         } else {
            y_axis_new_cases_trend.push(total_detected-data['model_data']);
         }
      }); 

      /*************************************************************************************************************/
      // Compute linear regression
      reg = compute_regression_with_dates(x_axis_date_new_cases,y_axis_new_cases,14,new Date(x_axis_date_new_cases_trend[x_axis_date_new_cases_trend.length-1]),'linear');
      x_trend_14 = reg['x'];
      y_trend_14 = reg['y'];
      

      // Compute linear regression
      reg = compute_regression_with_dates(x_axis_date_new_cases,y_axis_new_cases,7,new Date(x_axis_date_new_cases_trend[x_axis_date_new_cases_trend.length-1]),'linear');
      x_trend_7= reg['x'];
      y_trend_7 = reg['y'];
       
      // Compute polynomial regression from the beginning
      reg = compute_regression_with_dates(x_axis_date_new_cases,y_axis_new_cases,-1,new Date(x_axis_date_new_cases_trend[x_axis_date_new_cases_trend.length-1]),'poly');
      x_poly= reg['x'];
      y_poly = reg['y'];
     

      // Draw the Graph
      draw_new_cases_graph({
         "title":"<b>"+ data['summary_info']['state_name'] + ", New Cases per Day</b>",
         "el": "new_graph",
         "x1" : x_axis_date_new_cases,
         "y1": y_axis_new_cases,
         "title1": "New Cases",
         "x2": x_axis_date_new_cases_trend,
         "y2":  y_axis_new_cases_trend,
         "title2": "MIT Trend Model",
         "x3": x_trend_14,
         "y3": y_trend_14,
         "title3": "14-Day Trend",
         "x4": x_trend_7,
         "y4": y_trend_7,
         "title4": "7-Day Trend",
         "x5": x_poly,
         "y5": y_poly,
         "title5": "Curve"
      }); 
 
   }  
}

 
function draw_new_cases_graph(data) {
   
   // Get Range for X AXIS
   var maxDate1=new Date(Math.max.apply(null,data.x1));
   var minDate1=new Date(Math.min.apply(null,data.x1));
   var maxDate2=new Date(Math.max.apply(null,data.x2));
   var minDate2=new Date(Math.min.apply(null,data.x2)); 
   var max = (maxDate1<maxDate2)?maxDate2:maxDate1;
   var min = (minDate1<minDate2)?minDate1:minDate2;
   
   // MAX for Y AXIS
   var maxY = 1.2*( Math.max.apply(null,data.y1));
 
   // Org Data
   var dataSet1 = {
      x: data.x1,
      y: data.y1,
      name: data.title1,
      type: "bar",
      marker: {  color: 'rgb(209,41,41)'    }
   };

   // MIT Prevision
   var dataSet2 = {
      x: data.x2,
      y: data.y2,
      name: data.title2,
      type: "bar",
      xaxis: 'x2',
      marker: {  color: 'rgb(158,202,225)'  }
   };  

   // Linear Trend 1
   var dataSet3 = {
         x: data.x3,
         y: data.y3,
         name: data.title3,
         type: "line",
         xaxis: 'x2',
         line: {
            color: 'rgba(255,127,14,.8)',
         
         }
   };  

   // Linear Trend 2
   var dataSet4 = {
         x: data.x4,
         y: data.y4,
         name: data.title4,
         type: "line",
         xaxis: 'x2',
         line: {
            color: 'rgba(44,160,44,.8)',
         }
   };  


    // Polynomial Trend 2
    var dataSet5 = {
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
      title :  data.title,
      margin: {"t": 80, "b": 80, "l": 50, "r": 20},
      showlegend: true 
   };

   Plotly.newPlot('new_graph', [dataSet1,dataSet2,dataSet3,dataSet4,dataSet5], layout);
 
}