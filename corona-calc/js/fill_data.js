function fillJsonData() {
   var all_states = [ {st: "Alabama", a: "AL" }, {st: "Alaska", a: "AK" }, {st: "Arizona", a: "AZ" }, {st: "Arkansas", a: "AR" }, {st: "California", a: "CA" }, {st: "Colorado", a: "CO" }, {st: "Connecticut", a: "CT" }, {st: "Delaware", a: "DE" }, {st: "District of Columbia", a: "DC" }, {st: "Florida", a: "FL" }, {st: "Georgia", a: "GA" }, {st: "Hawaii", a: "HI" }, {st: "Idaho", a: "ID" }, {st: "Illinois", a: "IL" }, {st: "Indiana", a: "IN" }, {st: "Iowa", a: "IA" }, {st: "Kansas", a: "KS" }, {st: "Kentucky", a: "KY" }, {st: "Louisiana", a: "LA" }, {st: "Maine", a: "ME" }, {st: "Montana", a: "MT" }, {st: "Nebraska", a: "NE" }, {st: "Nevada", a: "NV" }, {st: "New Hampshire", a: "NH" }, {st: "New Jersey", a: "NJ" }, {st: "New Mexico", a: "NM" }, {st: "New York", a: "NY" }, {st: "North Carolina", a: "NC" }, {st: "North Dakota", a: "ND" }, {st: "Ohio", a: "OH" }, {st: "Oklahoma", a: "OK" }, {st: "Oregon", a: "OR" }, {st: "Maryland", a: "MD" }, {st: "Massachusetts", a: "MA" }, {st: "Michigan", a: "MI" }, {st: "Minnesota", a: "MN" }, {st: "Mississippi", a: "MS" }, {st: "Missouri", a: "MO" }, {st: "Pennsylvania", a: "PA" }, {st: "Rhode Island", a: "RI" }, {st: "South Carolina", a: "SC" }, {st: "South Dakota", a: "SD" }, {st: "Tennessee", a: "TN" }, {st: "Texas", a: "TX" }, {st: "Utah", a: "UT" }, {st: "Vermont", a: "VT" }, {st: "Virginia", a: "VA" }, {st: "Washington", a: "WA" }, {st: "West Virginia", a: "WV" }, {st: "Wisconsin", a: "WI" }, {st: "Wyoming", a: "WY" } ];
   var html= "<ul class='adp'>";

   $.each(all_states, function(i,v) {
      html += "<li><span>"+ v.st + " "  + "</span><a href='../json/"+v.a+".json"+"' target='_blank' title='COVID 19 Data for "+ v.st + " '>json</a> - <a href='./?"+v.a+"' title='COVID 19 Predicted outcome for "+ v.st + " '>Predicted outcome</a></li>";
   });

   $('#state_data').html(html+"</ul>");
}


function fillUSData() {
   var us = "../covid-19-data/us.csv";
   var dates =[], cases=[], deaths=[];
   var cases_trace, death_trace; 
   var all_us_data;

   // Get US.csv
   $.get(us, function(data) { 
      all_us_data = parseCSV(data);
      // Remove the header
      all_us_data = all_us_data.splice(1); 
 
      // Build graph serices
      $.each(all_us_data,function(i,v){
         //var v = v.split(',');
         dates.push(v[0]);
         cases.push(parseInt(v[1]));
         deaths.push(parseInt(v[2]));
      });
 
 
      cases_trace = {
         type: "scatter",
         mode: "lines",
         name: 'Cases',
         x: dates,
         y: cases,
         mode: 'lines+markers',
         type: 'scatter',
         line: {color: '#7F7F7F'}
      };

      death_trace = {
         type: "scatter",
         mode: "lines",
         name: 'Deaths',
         x: dates,
         y: deaths, 
         type: 'bar',
         marker: {
            color: '#c00'  
          },
         yaxis: 'y2'
      };
 
      Plotly.newPlot('us_graph', [cases_trace,death_trace], {responsive:true, title:'<b>US COVID-19 Deaths & Cases</b>',legend: { orientation: "h",  x: 0,
      y: 1},  yaxis2: {side:'right',overlaying: 'y',  titlefont: {color: '#c00'},  tickfont: {color: '#c00'},}});

      $('#tot_death').html(usFormat(deaths[deaths.length-1])).css('color','#7F7F7F');
      $('#tot_cases').html(usFormat(cases[cases.length-1])).css('color','#c00');

   });

  




}


$(function(){
   fillUSData();

   fillJsonData();

 
})


