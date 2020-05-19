// Display one group
function display_group(result, data, color, type) {

   var selected_state  = $("#state_selector").val(), county = false;
   
   // We Build the Graphs & Display for the "Good" states;
   $.each(data,function(state_code, values ){
   
      if(state_code !== "Unknown") {
            // Y data
            yd = values['avg_cases'];
            yd2 = values['cases'];
            xd = values['days'];
            // X data
            xdd = [];
            for (i = 0; i <= yd.length; i++) {
               xdd.push(i);
            } 

            // Full Name (for states)
            if(result['state_names'] !== undefined) {
               full_name = result['state_names'][state_code];
            } else {
               full_name = state_code + ", " + selected_state;
               county = true;
            }
            
            // Clean the name
            state_code = state_code.replace(/[^\w!?]/g,'');

            // Create the DIV
            $('<div class="graph_c"><h3>'+full_name+'</h3><div id="' + state_code+'"></div></div>').appendTo($('#'+type));

            // Plot Graph
            plot_data_line(xd,yd,yd2,"days since first case","new cases per day",full_name, state_code,"line",color);

            // What's going on if we click a graph?
            if(!county) {
               $('#'+ state_code).click(function() {
                  window.location.href = "gbu.html?" + state_code;
               });
            } else {
               // A click will go back to the all state page
               $('#'+ state_code).click(function() {
                  window.location.href = "gbu.html";
               });
            }
      } 
   })
}

function display_sum_info(result,state) {

   $('#sum_info_title, #sum_info, #graphs').show();
   state_code = state
   type = "sum_info"

   full_name = "Avg New Cases Per Day for " + state
   div_id = "sum_info_cases"

   color = "red"
   grp = result['sum_data']['group']
   if (grp == 'bad') {
      color = "orange"
   }
   if (grp == 'good') {
      color = "green"
   }

   xd = result['sum_data']['avg']['days']

   yd = result['sum_data']['avg']['cases']
   yd2 = result['sum_data']['stats']['cases']

   title_si_cases = "New Cases Per Day for " + state
   title_si_deaths = "New Deaths Per Day for " + state
   title_si_tests = "New Tests Per Day for " + state
   title_si_tests_pos_perc = "Positive % of Tests " + state

   document.getElementById("title_si_cases").innerHTML= title_si_cases;
   document.getElementById("title_si_deaths").innerHTML= title_si_deaths;
   document.getElementById("title_si_tests").innerHTML= title_si_tests;
   document.getElementById("title_si_tests_pos_perc").innerHTML= title_si_tests_pos_perc;
   plot_data_line(xd,yd,yd2,"days since first case","new cases per day",full_name, "sum_info_cases" ,"line",color);


   yd = result['sum_data']['avg']['deaths']
   yd2 = result['sum_data']['stats']['deaths']
   plot_data_line(xd,yd,yd2,"days since first case","new deaths per day",full_name, "sum_info_deaths" ,"line",color);

   var yd = []
   var yd_pp = []
   yd_tt2 = []
   yd_pp2 = []
   yd1 = result['sum_data']['avg']['tests_pos']
   yd2 = result['sum_data']['avg']['tests_neg']
   yd2_1 = result['sum_data']['stats']['tests_pos']
   yd2_2 = result['sum_data']['stats']['tests_neg']
   for (i = 0; i < yd1.length; i++) {
      tt = yd1[i] + yd2[i]
      tt2 = yd2_1[i] + yd2_2[i]
      if (tt < 0) {
         tt = 0
      }
      if (tt2 < 0) {
         tt2 = 0
      }
      yd.push(tt)
      yd_tt2.push(tt2)
      pp = 1 - (yd1[i]/(yd1[i] + yd2[i]))
      pp_2 = 1 - (yd2_1[i]/(yd2_1[i] + yd2_2[i]))
      if (pp >= .5 && state != 'NJ' && state != 'NY') {
         pp = 0
      }
      if (pp_2 >= .5 && state != 'NJ' && state != 'NY') {
         pp_2 = 0
      }
      if (pp_2 < 0) {
         pp_2 = 0 
      }
      yd_pp.push( pp*100)
      yd_pp2.push( pp_2*100)
   }

   plot_data_line(xd,yd,yd_tt2,"days since first case","new tests per day",full_name, "sum_info_tests" ,"line",color);

   plot_data_line(xd,yd_pp,yd_pp2,"days since first case","new tests per day",full_name, "sum_info_tests_pos_perc" ,"line",color);

}

function make_gbu(result,state) { 
 
   // We select the state in the main selector 
   $('#state_selector').val(state);

   if (state == "ALL") {
      $('#sum_info_title').closest('.box').hide();
      $('#sum_info_title, #sum_info').hide();
   }
   else {
      //$('<div class="graph_c"><h3>'+full_name+'</h3><div id=sum_info_"' + state_code+'"></div></div>').appendTo($('#sum_info'));
      display_sum_info(result,state)
      // file summary info div when we are looking at a specific state
      // for the summary show 3 graphs total cases in state, total deaths in state, total_tests in state

   }
  
   if(Object.keys(result['groups']['good']).length<=0) {
      // No Good Result
      $('#good_title').closest('.box').hide();
      $('#good_title, #good').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#good_title, #good, #graphs').show();
      display_group(result, result['groups']['good'], "green", "good");
   }

   if(Object.keys(result['groups']['bad']).length<=0) {
      // No Bad Result
      $('#bad_title').closest('.box').hide();
      $('#bad_title, #bad').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#bad_title, #bad, #graphs').show();
      display_group(result, result['groups']['bad'], "orange", "bad");
   }

    
   if(typeof result['groups']['low_cases'] == "undefined" || Object.keys(result['groups']['low_cases']).length<=0) {
      // No Good Result
      $('#low_cases_title').closest('.box').hide();
      $('#low_cases_title, #low_cases').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#low_cases_title, #low_cases, #graphs').show();
      display_group(result, result['groups']['low_cases'], "black", "low_cases");
  }


   if(Object.keys(result['groups']['ugly']).length<=0) {
      // No Ugly Result
      $('#ugly_title').closest('.box').hide();
      $('#ugly_title, #ugly').hide();
   } else {
      // We show before building otherwide plotly doesn't create the graphs properly
      $('#ugly_title, #ugly, #graphs').show();
      display_group(result, result['groups']['ugly'], "red", "ugly");
   }

   
 
}

function plot_data_line(xd,yd,yd2,xl,yl,t,dv,type,color) {
  
   var trace1 = {
      x: xd,
      y: yd,
      name: yl,
      marker : {   
         color: color   
      },
      hoverinfo: 'none',
      hovermode: 'none',
      mode: 'lines',
      type: type
   };
   var trace2 = {
      x: xd,
      y: yd2,
      name: yl,
      marker : {   
         color: '#D3D3D3',
         opactity: .01,
         size: 4
      },
      hoverinfo: 'none',
      hovermode: 'none',
      mode: 'markers',
      type: 'bar' 
   };
   // Trends shouldn't start at 0
   var data = [trace1,trace2]; // , trace4
   var layout = {
      autosize: false,
      width: 345,
      height: 350,
      showlegend: false,
      margin: {"t": 5, "b": 50, "l": 50, "r": 30},
      yaxis: {fixedrange: true},
      xaxis : {fixedrange: true}
   }

   Plotly.newPlot(dv, data, layout, {responsive: true});
}

function show_gbu_loader() {
   $('#loader').css('display','block');  
   $('body').addClass('wait');
}


function hide_gbu_loader() {
   $('#loader').css('display','none');  
   $('body').removeClass('wait');
}



function gbuInit(url,state) {
   show_gbu_loader();
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",

      success: function (result, status, xhr) { 
         make_gbu(result,state);
         hide_gbu_loader();
      },
      error: function (xhr, status, error) {
         alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         hide_gbu_loader();
      }
   });

   // Action on selector 
   $('#state_selector').change(function() {
     
      if($(this).val()=='ALL') {
         window.location.href = "gbu.html";
      } else {
         window.location.href = "gbu.html?" + $(this).val();
      }
   });   
}

function make_alerts(result ) {

   var row_count = Object.keys(result).length
   alert_count = row_count + " Counties Matching Criteria"
   document.getElementById("alert_count").innerHTML= alert_count;

   $.each(result,function(key, values){   
      yd = values['avg_cases']
      yd2 = values['cases']
      xdd = values['days']
      delta = values['delta']
      delta14 = values['delta14']
      xd = []
      for (i = 0; i <= yd.length; i++) {
         xd.push(i)
      }
      // Create the DIV
      temp = key.split(":")
      st =temp[0]
      ct =temp[1]
      full_name = ct + ", " + st 
      dtxt = " &Delta;7-Day: " + delta.toString() + "&nbsp;&nbsp;&Delta;14-Day: " + delta14.toString() 
      state_code = key 
      color = "red"
      type = "ugly"
      $('#ugly_title, #ugly, #graphs').show();
      $('<div class="graph_c"><h3 style="margin-bottom:0">'+full_name+'</h3><p style="margin-top:.5rem"><small>' + dtxt + '</small></p><div id="' + state_code+'"></div></div>').appendTo($('#'+type));

      // Plot Graph
      plot_data_line(xdd,yd,yd2,"days since first case","new cases per day",full_name, state_code,"line",color);


   })
}

function alertsInit(url) {
   show_gbu_loader();
   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",

      success: function (result, status, xhr) {
         make_alerts(result);
         hide_gbu_loader();
      },
      error: function (xhr, status, error) {
         alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         hide_gbu_loader();
      }
   });

}

