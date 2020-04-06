function actionsOnSVGState() {
   $('path,circle').mouseenter(function() {
      var $t = $(this);
      var state = $t.attr('id'); 
      $("path, tr,circle").removeClass('on');
      $("path#"+state).addClass('on'); 
      $("tr[data-state="+state+"]").addClass('on');

   }).mouseleave(function() {
      $('path, tr').removeClass('on');
   }).click(function() {
      var $t = $(this);
      var state = $t.attr('id'); 
      if(state!='frames') {
         window.location = "./states/" + state + ".html"
      }
   });
}

function actionOnTable() {
   $('tbody tr').mouseenter(function() {
      var $t = $(this);
      var state = $t.attr('data-state');  
      $("path, tr, circle").removeClass('on');
      $("path#"+state).addClass('on'); 
      $("tr[data-state="+state+"]").addClass('on');
   }).mouseleave(function() {
      $('path, tr').removeClass('on');
   }).click(function() {
      var $t = $(this);
      var state = $t.attr('data-state'); 
      window.location = "./states/" + state + ".html"
   });
}