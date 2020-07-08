export function getCurrentDate(separator='-'){

   let newDate = new Date()
   let date = newDate.getDate();
   let month = newDate.getMonth() + 1;
   let year = newDate.getFullYear();
   
   return `${year}${separator}${month<10?`0${month}`:`${month}`}${separator}${date}`
}


/**
 * Get Today Line Info
 * to add it to the graphs
 */
export function getTodayLine(y1,y2) {
   const todayLine =  [{
      type: 'line',
      x0:   getCurrentDate(),
      y0: 0,
      x1:   getCurrentDate(),
      yref: 'paper',
      y1: 1.2,
      line: {
         color: 'grey',
         width: 1.5,
         dash: 'dot'
      }
   }]
   
   // Today bar
   const todayAnnotation = [
      {
        x: getCurrentDate(),
        y: Math.max(...[y1,y2]),
        xref: 'x',
        yref: 'y',
        text: 'Today', 
        ax: -20,
        ay: -20,
        showarrow: false
      }
    ];

    return {
       'line': todayLine,
       'annotation':todayAnnotation
    }
}


/**
 * Get Observed data 
 * @param {*} data 
 * @param {*} type 
 * @param {*} type_name 
 */
export function generateObservedData(data,type,type_name) {  
   var all_dates = [];
   var all_values = [];

   for(const d of data){
      all_dates.push(d['date']);
      all_values.push(d[type]);
   } 
   return  { 
            
               'type': 'scatter',
               'mode': 'lines+points',
               'hovertemplate': '<b>Date</b>: %{x}<br><i>Observed</i>: %{y} '  + type_name,
               'x': all_dates,
               'y': all_values,
               'marker': {color: 'red'},
               'name': 'Observerd ' + type_name
            } 
   } 

/**
 * Get Projected Data
 * @param {*} data 
 * @param {*} type 
 * @param {*} type_name 
 */
export function generateProjectedData(data,type,type_name) {  
   var all_dates = [];
   var all_values = [];

   for(const d of data){
      all_dates.push(d['date']);
      all_values.push(d[type]);
   }

   return  {
      'mode': 'lines',
      'x': all_dates,
      'y': all_values, 
      'hovertemplate': '<b>Date</b>: %{x}<br><i>Projected</i>: %{y} '  + type_name,
      'marker': {color: 'darkgrey'}, 
      'name': 'Projected ' + type_name,
      'line': {
         'dash': 'dash',
         'width': 2
       }
   }   
 
}
