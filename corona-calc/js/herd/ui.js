function display_top_results(state,county,how_many_days_until_herd,start_data,end_data, name_to_display, graph_data_y) {
 
   // We compute the herd_immunity day
   var herd_immunity_reached_day_start = new Date($('input[name=last_day_of_data]').val());
   var herd_immunity_reached_day; 
   herd_immunity_reached_day =  herd_immunity_reached_day_start.addDays(how_many_days_until_herd);
 
   herd_immunity_reached_day_start = new Date($('input[name=last_day_of_data]').val());
   var graph_x = [];

   fill_top_table(herd_immunity_reached_day,start_data,end_data);
   fill_top_sentence(state,county,herd_immunity_reached_day,end_data,name_to_display);
   create_pies(start_data,end_data,herd_immunity_reached_day);

   // Create X for the graphs
   while (herd_immunity_reached_day_start <= herd_immunity_reached_day) {
         graph_x.push(new Date (herd_immunity_reached_day_start));
         herd_immunity_reached_day_start = herd_immunity_reached_day_start.addDays(1);
   }
 
   // We draw the graph
   draw_graph_herd({
      x1: graph_x,
      y1: graph_data_y.new_cases,
      title1: "Total Confirmed Cases",

      x2: graph_x,
      y2: graph_data_y.non_tracked_infected,
      title2: "Total Non Tracked Cases",
      
      x3: graph_x,
      y3: graph_data_y.deads,
      title3: "Total COVID-19 Deaths",

      title: "<b>" + name_to_display + " - Path to Herd Immunity </b>",
      threshold: start_data.herd_immunity_threshold/100,

      el: 'perc_graph',
      el_title: 'perc' 
   });
   
    
 
}


function fill_top_table(herd_immunity_reached_day,start_data,end_data) {
   var tbody = ""; 
 
   // For having 100% total despite the round
   var perc_not_infected_start = 100;
   var per_start = [];
   var per_end = [];
   var temp_per_start, temp_per_end;
   perc_not_infected_end = perc_not_infected_start;
  
   // Date on table head
   $(".day_end").text('on ' + dateFormatMITFromDate(herd_immunity_reached_day) );

   temp_per_start = parseFloat(start_data.deads*100/start_data.pop).toFixed(2);
   temp_per_end = parseFloat(end_data.deads*100/end_data.pop).toFixed(2);

   per_start.push(temp_per_start);
   per_end.push(temp_per_end);

   tbody += "<tr><th>COVID-19 Deaths</th>\
                 <td>"+usFormat(start_data.deads)+"</td>\
                 <td>"+temp_per_start+"%</td>\
                 <td>"+usFormat(parseInt(end_data.deads))+ "</td>\
                 <td>"+temp_per_end+"%</td></tr>";

   temp_per_start = parseFloat(start_data.total_infected*100/start_data.pop).toFixed(2);
   temp_per_end   = parseFloat(end_data.total_infected*100/end_data.pop).toFixed(2);

   per_start.push(temp_per_start);
   per_end.push(temp_per_end);

   tbody += "<tr><th>Confirmed Infected people</th>\
                <td>"+usFormat(start_data.total_infected)+"</td>\
                <td>"+parseFloat(start_data.total_infected*100/start_data.pop).toFixed(2)+"%</td>\
                <td>"+usFormat(parseInt(end_data.total_infected))+"</td>\
                <td>"+parseFloat(end_data.total_infected*100/end_data.pop).toFixed(2)+"%</td></tr>";
   
   temp_per_start = parseFloat(start_data.non_tracked_infected*100/start_data.pop).toFixed(2);
   temp_per_end   = parseFloat(end_data.non_tracked_infected*100/end_data.pop).toFixed(2);

   per_start.push(temp_per_start);
   per_end.push(temp_per_end);

   tbody += "<tr><th>Non-Tracked Infected people</th>\
               <td>"+usFormat(parseInt(start_data.non_tracked_infected))+"</td>\
               <td>"+parseFloat(start_data.non_tracked_infected*100/start_data.pop).toFixed(2)+"%</td>\
               <td>"+usFormat(parseInt(end_data.non_tracked_infected))+"</td>\
               <td>"+parseFloat(end_data.non_tracked_infected*100/end_data.pop).toFixed(2)+"%</td></tr>";


   // In order to have really 100% despited the round 
   $.each(per_start, function(i,v) {
      perc_not_infected_start -= parseFloat(v);
   }); 
   $.each(per_end, function(i,v) {
      perc_not_infected_end -= parseFloat(v);
   }); 
   
   
   tbody += "<tr><th>Non-Infected people</th>\
               <td>"+usFormat(parseInt(start_data.not_infected))+"</td>\
               <td>"+perc_not_infected_start.toFixed(2)+"%</td>\
               <td>"+usFormat(parseInt(end_data.not_infected))+"</td>\
               <td>"+perc_not_infected_end.toFixed(2)+"%</td></tr>";
   
   $("#sum_table tbody").html(tbody);


}


function fill_top_sentence(state,county,herd_immunity_reached_day,end_data,name_to_display) {
   $('#sum_main').html("");
   var top_sentence = "Based on the current data,<br><span class='ugly_t'>" + name_to_display;
   top_sentence += " could reach herd immunity on <span class='wn'>"+dateFormatMITFromDate(herd_immunity_reached_day) + "</span></span>.";
   $('#sum_main').html(top_sentence);
}


function create_pies(start_data,end_data,herd_immunity_reached_day) {
   var pie_lb = [ 'Not Infected', 'Infected', 'Confirmed Cases', 'Deaths'];
   plot_pie([start_data.not_infected, start_data.non_tracked_infected, start_data.total_infected,  start_data.deads],pie_lb,"Current","current_pie");
   plot_pie([end_data.not_infected, end_data.non_tracked_infected, end_data.total_infected,  end_data.deads],pie_lb,"On " + dateFormatMITFromDate(herd_immunity_reached_day),"end_pie");

}


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





/**
 * Setup action on selects
 */
function setupActions() {
 
   // Creation action on recalculate button
   $('#recalculate').click(function() { 
      $(this).attr('data-htmlx',$(this).html()).html('Computing...');
      $('body').addClass('wait');
      setTimeout(function() {
         prepare_data(cur_all_data);
         $('#recalculate').html($('#recalculate').attr('data-htmlx'));
         $('body').removeClass('wait');
      },850);
   });
 
   $('#reset').click(function() {
      reset();
      $('#recalculate').trigger('click');
   })
 
}
 