function compare( a, b ) {
   if ( a.date < b.date ){
     return -1;
   }
   if ( a.date > b.date ){
     return 1;
   }
   return 0;
 }
 
 


/**
 * Return the proper data based on Country
 */
function getInitDataCountry(data,country) {
   var toReturn;
   var country_stats = [], all_dates = [];
   
 
   $.each(data,function(i,v) { 
      country_stats.push({
         'date':                    i,
         'new_cases_per_million':   parseFloat(v.ncpm), //>=0?parseFloat(v.ncpm):0,
         'new_deaths_per_million':  parseFloat(v.ndpm), //>=0?parseFloat(v.ndpm):0,
         'total_cases_per_million': parseFloat(v.tcpm), //>=0?parseFloat(v.tcpm):0,
         'total_deaths_per_million':parseFloat(v.tdpm)  //>=0?parseFloat(v.tdpm):0 
      });
      all_dates.push(new Date(i));
   })
 
   // Sort country states per date
   country_stats.sort( compare );
 

   // State Data
   toReturn =  { 
      name:       country, 
      stats:      country_stats,
      last_date:  new Date(Math.max.apply(null,all_dates))
   };    

   return toReturn;
}

/**
 * Compute all the needed data for the graphs
 */
function prepareData(data) {
 
   var x_axis  = [];  

   // new_cases_per_million  
   var y_axis_ncpm = [];

   // new_deaths_per_million 
   var y_axis_ndpm = [];
   
   // total_cases_per_million 
   var y_axis_tcpm = [];

   // total_deaths_per_million 
   var y_axis_tdpm = [];
 

   $.each(data['stats'], function(i,val) { 
      x_axis.push(val.date);
      y_axis_ncpm.push(val.new_cases_per_million);
      y_axis_ndpm.push(val.new_deaths_per_million);
      y_axis_tcpm.push(val.total_cases_per_million);
      y_axis_tdpm.push(val.total_deaths_per_million);
   });
    
   return {
      x_axis:     x_axis,
      new_cases_per_million:        y_axis_ncpm,
      new_deaths_per_million:       y_axis_ndpm,
      total_cases_per_million:      y_axis_tcpm,
      total_deaths_per_million:     y_axis_tdpm
   }
}

 





/**
 * Draw one single graph 
 */
function draw_comparison_graph(rightDate,name1,data1,name2,data2,x_axis1,x_axis2,type,domEl,domElTitle,  indexData1,  indexData2,color1,color2 ,bars) {
    
   // Get the Max Date on Both (we don't care if don't have all the data for both data sets)
   var domElRef;
   

   // Remove the fips from the county names
   if(name1.indexOf("--")!==-1) {
      name1 = name1.substring(0,name1.indexOf("--"));
   }

   if(name2.indexOf("--")!==-1) {
      name2 = name2.substring(0,name2.indexOf("--"));
   }


   var set1 = {
      x: x_axis1,
      y: data1,
      name: name1 + " " + type,
      fill: 'tonexty',
      type: (bars?'bar':"line+scatter"),
      marker: {color: color1},
   };
 
   var set2 = {
      x: x_axis2,
      y: data2,
      name: name2 + " " + type,
      type: 'scatter', 
      marker: {color: color2},
   }; 
   
   if(bars) {
      set2.line = {shape:'vh'}; 
   }

   var layout = { 
      margin: {"t": 20, "b": 80, "l": 50, "r": 20},
      showlegend: true,
      legend: { orientation: "h" },
      yaxis1: {   
         title:type
      } 
   };
 
   // Top Graph      
   display_graph_top_info(
         rightDate,
         name1,
         data1[indexData1],
         name2,
         data2[indexData2],
         type,
         domElTitle,
         color1,
         color2);

   // Update on Hover
   Plotly.newPlot(domEl, [set1,set2], layout);
   domElRef = document.getElementById(domEl); 
 
   // Hover
   domElRef.on('plotly_hover', function(data){
 
      var info = data.points.map(function(d){
         return {"date": d.x, "val":d.y };
      });
   
      if(info != undefined && info[1] !== undefined && info[0] !== undefined) {
         var data1Det, data2Det;

         if(!bars) {
            data1Det = usFormatCommas(info[0].val);
            data2Det = usFormatCommas(info[1].val);
         } else {
            data1Det = usFormatCommas(info[1].val);
            data2Det = usFormatCommas(info[0].val);
         }
         
      
         if(data1Det[1] === undefined) { data1Det[1] = "000";  }
         if(data2Det[1] === undefined) { data2Det[1] = "000";  }
   
   
         $(domElTitle).find('h3 b').html(info[0].date.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric" 
          }));
        
        
         $(domElTitle).find('.c1 .cpbnb').html(data1Det[0] +  '<span  class="cpbnb-d">.' + data1Det[1] + '</span>' ); 
         $(domElTitle).find('.c2 .cpbnb').html(data2Det[0] +  '<span  class="cpbnb-d">.' + data2Det[1] + '</span>' ); 
      }

     
   }); 


   // Reset on mouseout
   $(domElRef).mouseout(function(){
      
      $(domElTitle).find('[data-org]').each(function() {
         var $t = $(this);
         if($t.attr('data-org') !== undefined) {
            $t.html($t.attr('data-org'));
         }
         if($t.attr('data-org1') !== undefined) {
            $t.html($t.attr('data-org1'));
         }
         if($t.attr('data-org2') !== undefined) {
            $t.html($t.attr('data-org2'));
         }
      });

    

   });

}


/**
 * US Format Float
 */
function usFormatCommas(x) {
   var x = parseFloat(x).toFixed(3);
   var toReturn  = x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
   toReturn = toReturn.split('.'); 
   return [toReturn[0],toReturn[1]];
}


/**
 * Draw standard graph with 7,14 trends and eventual
 * @param {*} data 
 */
function draw_country_graph(init_data1,graph_data1,init_data2,graph_data2) {

      var color1 = 'rgba(200, 0 , 0,.8)';
      var color2 = 'rgba(50, 0, 50,.8)';
   
      var maxDateData1 = new Date(Math.max.apply(null, graph_data1.x_axis.map(function(e) {
         return new Date(e);
       })));

      var maxDateData2 = new Date(Math.max.apply(null, graph_data2.x_axis.map(function(e) {
         return new Date(e);
       })));
  
      var rightDateLastData = new Date(Math.min.apply(null, [maxDateData1,maxDateData2].map(function(e) {
         return new Date(e);
      }))); 
 
      // We need to find the related indexes  
      var rightDate  =  rightDateLastData.getFullYear() + "-" + ("0"+(rightDateLastData.getMonth()+1)).slice(-2)  +  "-" + ("0" + rightDateLastData.getDate()).slice(-2);
   
      // Find the index
      var indexData1 = graph_data1.x_axis.indexOf(rightDate);
      var indexData2 = graph_data2.x_axis.indexOf(rightDate); 
 
      // We need the min of the two max!
      draw_comparison_graph(
         rightDate,
         init_data1.name,
         graph_data1.new_cases_per_million,
         init_data2.name,
         graph_data2.new_cases_per_million,
         graph_data1.x_axis,
         graph_data2.x_axis,
         "New Cases Per Million",
         "country_graph4",
         '#country_graph_title4',
         indexData1,
         indexData2,
         color1,
         color2, 
         true);
      
      draw_comparison_graph(
         rightDate,
         init_data1.name,
         graph_data1.new_deaths_per_million,
         init_data2.name,
         graph_data2.new_deaths_per_million,
         graph_data1.x_axis,
         graph_data2.x_axis,
         "New Deaths Per Million",
         "country_graph3",
         '#country_graph_title3',
         indexData1,
         indexData2,
         color1,
         color2, 
         true);
      
      draw_comparison_graph(
         rightDate,
         init_data1.name,
         graph_data1.total_deaths_per_million,
         init_data2.name,
         graph_data2.total_deaths_per_million,
         graph_data1.x_axis,
         graph_data2.x_axis,
         "Total Deaths Per Million",
         "country_graph1",
         '#country_graph_title1',
         indexData1,
         indexData2,
         color1,
         color2, 
         false);

       
      draw_comparison_graph(
         rightDate,
         init_data1.name,
         graph_data1.total_cases_per_million,
         init_data2.name,
         graph_data2.total_cases_per_million,
         graph_data1.x_axis,
         graph_data2.x_axis,
         "Total Cases Per Million",
         "country_graph2",
         '#country_graph_title2',
         indexData1,
         indexData2,
         color1,
         color2, 
         false); 
    
       
}



/**
 * Display top info for each graph
 */

function display_graph_top_info(last_date,name1,data1,name2,data2,type, domEl, color1, color2) {
   
   var formattedDate = last_date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric" 
    });

   var data1Det = usFormatCommas(data1);
   var data2Det = usFormatCommas(data2);

   if(data1Det[1] === undefined) { data1Det[1] = "000";  }
   if(data2Det[1] === undefined) { data2Det[1] = "000";  }

 
   $(domEl).html(
      '<h3>' + type + ' on <b data-org="'+formattedDate+'">' + formattedDate + '</b></h3>\
      <div class="comp_box" >\
         <div class="c1">\
            <div class="cpb" style="background-color:'+ color1 +' ">\
               <div class="cpbn">' + name1+ '</div>\
               <div class="cpbnb" data-org1="'+data1Det[0]+'" data-org2=".'+data1Det[1]+'">' + data1Det[0] +'<span  class="cpbnb-d">.' +  data1Det[1] + '</span></div>\
               <div class="cpbt">' + type + '</div>\
            </div>\
         </div>\
         <div class="c2">\
            <div class="cpb" style="background-color:'+ color2+' ">\
            <div class="cpbn">' + name2+ '</div>\
            <div class="cpbnb" data-org2="'+data2Det[0]+'" data-org2=".'+data2Det[1]+'">' + data2Det[0] +'<span  class="cpbnb-d">.' +  data2Det[1] + '</span></div>\
            <div class="cpbt">' + type + '</div>\
         </div>\
      </div>'); 
}