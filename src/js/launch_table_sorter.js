function launch_sorter() {

   if($('#country-table').length!=0) {
      $.tablesorter.addParser({ 
         id: 'us_format',
         is: function(s) {   return false;  }, 
         format: function(s) {
             // format your data for normalization 
             return s.replace(',','').replace(/,/g,'');
         }, 
         // set type, either numeric or text 
         type: 'numeric' 
     }); 
     

      $("table thead th:eq(0)").data("sorter", false);
      $('table').tablesorter({
         widgets        : ['zebra', 'columns'],
         usNumberFormat : false,
         sortReset      : true,
         sortRestart    : true,
         headers: {
            2:{ sorter:'us_format'},
            3:{ sorter:'us_format'},
            4:{ sorter:'us_format'},
            5:{ sorter:'us_format'},
            6:{ sorter:'us_format'} 
         }
      });

      // Default Sorting: CPM
      $('th[data-column=5]').click().click();


   
   }

  
}