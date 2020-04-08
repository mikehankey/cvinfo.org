

function actionOnSVGCounty() {
   $('path,circle').mouseenter(function() {
      var $t = $(this);
      var state = $t.attr('id'); 
      $("path, tr,circle").removeClass('on');
      $("path#"+state).addClass('on'); 
      $("tr[data-state="+state+"]").addClass('on');

   }).mouseleave(function() {
      $('path, tr').removeClass('on');
   })
   
   
   /*.click(function() {
      var $t = $(this);
      var state = $t.attr('id'); 
      if(state!='frames') {
         window.location = "./states/" + state + ".html"
      }
   });
   */
}
 

$(function() {
    // Set Active State
    $('a[href="'+cur_state+'.html"]').addClass('active');
})


function open_modal() {
   var modal = document.getElementById("graph_img_viewer");
   var modalImg = document.getElementById("img_fv"); 

  $('.cell img').click(function() {
      modal.style.display = "block";
      modalImg.src = $(this).attr('src'); 
  })
}

function sleep(seconds){
   var waitUntil = new Date().getTime() + seconds*1000;
   while(new Date().getTime() < waitUntil) true;
}


$(function() {
  

   var all_anim = $(".play").closest('.image_player').find('.anim_svg'); 
   var all_ids = [];

   $(all_anim).each(function(){
      all_ids.push($(this).attr('id'));
   });

   var cur_inx = 0;

   $('.play').click(function() {


      $('.anim_svg').css('display','none'); 
      $('#'+all_ids[cur_inx]).css('display','block'); 

      if(cur_inx >  all_ids.length) {
         cur_inx = 0;
      } else {
         cur_inx++;
      }
   });
})