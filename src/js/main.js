  $(function() {
  
   if($('#us_map').lenght!=0) {
      // Main
      actionsOnSVGState();
   }

   if($('#state').length!=0) {
      // State
      actionOnSVGCounty();
   }

   actionOnTable();
   launch_sorter();
})