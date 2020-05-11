
function update_state_select(state_code) {
   select_html = "<p>To see all counties for a state select below " 
   if (state_code == "ALL") {
      select_html += " or click on a state's graph. "
   }
   select_html += "</p>"
   select_html += "<select id=state_code onChange='javascript:goto()'><option value='ALL'>All States\n"
   Object.keys(state_names).sort().forEach(function(prop) {
      if (prop == state_code) {
         select_html += "<option selected value='" + prop + "'>" + state_names[prop] + "\n"
      } else {
         select_html += "<option value='" + prop + "'>" + state_names[prop] + "\n"
      }

   })
   select_html += "</select>"

   document.getElementById("state_select").innerHTML= select_html

}

function goto() {
   var s = document.getElementById("state_code")
   var state_code = s.options[s.selectedIndex].value
   if (state_code == "ALL") {
      window.location.href = "gbu.html" 
   } else {
      window.location.href = "gbu.html?" + state_code
   }

}


function make_gbu(result,state) {
   update_state_select(state)
   good_html = ""
   bad_html = ""
   ugly_html = ""
   if (Object.keys(result['groups']['good']).length > 0) {
      good_html = "<h1>Winning</h1> <p>Current value is less than 40% of the highest peak value OR lastest new cases is less than 5 per day.</p>"
   }
   //for (const prop in result['groups']['good']) {
   Object.keys(result['groups']['good']).sort().forEach(function(prop) {
      if (result['groups']['good'].hasOwnProperty(prop)) {
         div = prop.replace("'", "")
         if (state == "ALL") {
            good_html += "<a href=gbu.html?" + prop + "><div id='" + div + "' class='sq_plot'></div></a>" 
         } else {
            good_html += "<div id='" + div + "' class='sq_plot'></div>" 

         }
      }
   })

   document.getElementById("good").innerHTML= good_html

   if (Object.keys(result['groups']['bad']).length > 0) {
      bad_html = "<h1>Improving</h1><p>Current value is between 40-80% of the highest peak value.</p>"
   }
   //for (const prop in result['groups']['bad']) {
   Object.keys(result['groups']['bad']).sort().forEach(function(prop) {
      if (result['groups']['bad'].hasOwnProperty(prop)) {
         div = prop.replace("'", "")
         if (state == "ALL") {
            bad_html += "<a href=gbu.html?" + prop + "><div id='" + div + "' class='sq_plot'></div></a>"
         } else {
            bad_html += "<div id='" + div + "' class='sq_plot'></div>"
         }
      }
   })

   document.getElementById("bad").innerHTML= bad_html

   if (Object.keys(result['groups']['ugly']).length > 0) {
      ugly_html = "<h1>Loosing</h1><p>Current value is greater than 80% of the highest peak value.</p>"
   }
   //for (const prop in result['groups']['ugly']) {
   Object.keys(result['groups']['ugly']).sort().forEach(function(prop) {
      if (result['groups']['ugly'].hasOwnProperty(prop)) {
         div = prop.replace("'", "")
         if (state == "ALL") {
            ugly_html += "<a href=gbu.html?" + prop + "><div id='" + div + "' class='sq_plot'></div></a>"
         } else {
            ugly_html += "<div id='" + div + "' class='sq_plot'></div>"
         }
      }
   })

   document.getElementById("ugly").innerHTML= ugly_html

   for (const prop in result['groups']['good']) {
      yd = result['groups']['good'][prop]
      xd = []
      for (i = 0; i <= yd.length; i++) {
         xd.push(i)
      }
      if (state == "ALL") {
         sn = result['state_names'][prop]
      } 
      else {
         tt = prop + ", " + state
         sn = tt
      }
      div = prop.replace("'", "")
      
      plot_data_line(xd,yd,"days since first case","new cases per day",sn,div,"line","green")
   }

   for (const prop in result['groups']['bad']) {
      yd = result['groups']['bad'][prop]
      xd = []
      for (i = 0; i <= yd.length; i++) {
         xd.push(i)
      }
      if (state == "ALL") {
         sn = result['state_names'][prop]
      }
      else {
         tt = prop + ", " + state
         sn = tt
      }
      div = prop.replace("'", "")
      plot_data_line(xd,yd,"days since first case","new cases per day",sn,div,"line","orange")
   }

   for (const prop in result['groups']['ugly']) {
      yd = result['groups']['ugly'][prop]
      xd = []
      for (i = 0; i <= yd.length; i++) {
         xd.push(i)
      }
      if (state == "ALL") {
         sn = result['state_names'][prop]
      }
      else {
         tt = prop + ", " + state
         sn = tt
      }
      div = prop.replace("'", "")
      plot_data_line(xd,yd,"days since first case","new cases per day",sn,div,"line","red")
   }


}

function plot_data_line(xd,yd,xl,yl,t,dv,type,color) {
   var ymax = Math.max.apply(Math, yd) * 1.2;

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

   // Trends shouldn't start at 0
   var data = [trace1]; // , trace4
   var layout = {
      title :  { 
         text: t,
         y: 0.10,
         
         yanchor: 'bottom'
      }
   }

   Plotly.newPlot(dv, data, layout, {responsive: true}, config={displayModeBar: false});
}

function gbuInit(url,state) {
   /*
   if(typeof reload == 'undefined') {
      show_loader();
   }
   */

   $.ajax({
      type: "get",
      url:  url,
      dataType: "json",

      success: function (result, status, xhr) {

         // Create Select County
         /*
         countySelect(getAllCounties(result) , state);
         $('#county_selector').unbind("change").change(function(e) {
            change_county();
            return false;
         })
         */

         cur_json_data = result;
         //cur_county     = county;
         cur_state      = state;
         make_gbu(result,state)
         //hide_loader();
         //$('#recalculate').html($('#recalculate').attr('data-htmlx'));
         //$('#recalculate').removeAttr('data-htmlx');


      },
      error: function (xhr, status, error) {
         alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
         //hide_loader();
      }
   });
}

