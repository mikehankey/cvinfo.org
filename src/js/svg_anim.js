var playing_inter; // Interval
var cur_index;


// Update  Date in title based
function update_title_date(id) {
   // Transform id to date & display
   var _date = id.slice(-8);
   $('#anim_date').fadeOut(25, function() {
      $('#anim_date').text(_date.substring(0,4)+"-"+_date.substring(4,6)+"-"+_date.substring(6,10));
      $('#anim_date').fadeIn(100);
   });

}

// Update Current State Date
function update_current_state_data(index,type) {
   var data_array = window[type+'_vals']; 
   $('#cur_type_val').text(data_array[index]);
}
 

// Here we get how many svg images we have per type
function anim_play(type) {
   var $container = $('.image_player[data-rel='+type+']');

   // Cur visible
   var all = $container.find('.anim_svg');
   var cur = $container.find('.anim_svg:visible');
   
   var all_index = all.length-1;
   var next_index;

   // Get the index of the current one
   for(var i=0;i<all.length;i++) {
      if($(all[i]).attr('id')==$(cur).attr('id')) {
         cur_index = i;
         break;
      }
   } 

   if(cur_index==all_index) {
      next_index = 0
   } else {
      next_index = cur_index + 1
   }

   // We hide it
   cur.hide(); 

   // We show the Next one
   $(all[next_index]).show();
   update_title_date($(all[next_index]).attr('id'));
   update_current_state_data(next_index,type);

}
 

$(function() {
   $('.btn-anim.m').click(function(e) {
      e.stopPropagation();
   
      var type = $(this).closest('.image_player').attr('data-rel');
   
      if($(this).hasClass('btn-play')) {
         $(this).removeClass('btn-play').addClass('btn-pause');
         playing_inter = setInterval(function(){  anim_play(type); }, 500);
      } else {
         $(this).removeClass('btn-pause').addClass('btn-play');
         clearInterval(playing_inter);
      }
      return false;
   });


   $('#anim_selector').change(function() {
      
      var new_type = $('#anim_selector').val();

      // If playing, we pause
      clearInterval(playing_inter);
      $('.btn-anim.m').removeClass('btn-pause').addClass('btn-play');

      // Update string of cur_type_st
      $('#cur_type_st').text($('#anim_selector option:selected').text());
 
      // We hide all the types
      $('.image_player').css('display','none');
      $('.image_player[data-rel='+new_type+']').css('display','block');
      $('.anim_svg').css('display','none');
      
      // We display the cur_index one
     
      var all_anim = $('.image_player[data-rel='+new_type+'] .anim_svg');
      
      if(typeof cur_index == "undefined") {
          data_array = window[new_type+'_vals'];  
          cur_index = data_array.length-2; // LAst one
      }
       


      $(all_anim[cur_index]).css('display','block');

      // We play immediatly
      // $('.image_player[data-rel='+new_type+']').find('.btn-anim.m').click();

      // We update the value 
      update_current_state_data(cur_index,new_type);

   });


   // Backward
   $('.btn-backward').click(function(e) {
      e.stopPropagation();
      var type = $(this).closest('.image_player').attr('data-rel');

      // Show Previous 
      var $container = $('.image_player[data-rel='+type+']');

      // Cur visible
      var all = $container.find('.anim_svg');
      var cur = $container.find('.anim_svg:visible');
      
      var all_index = all.length-1;
      var next_index;

      // Get the index of the current one
      for(var i=0;i<all.length;i++) {
         if($(all[i]).attr('id')==$(cur).attr('id')) {
            cur_index = i;
            break;
         }
      } 

      if(cur_index==0) {
         next_index = all_index
      } else {
         next_index = cur_index - 1
      }

      // We hide it
      cur.hide(); 

      // We show the Next one
      $(all[next_index]).show();
      update_title_date($(all[next_index]).attr('id'));
      update_current_state_data(next_index,type);
   });


    // Backward
    $('.btn-forward').click(function(e) {
      e.stopPropagation();
      var type = $(this).closest('.image_player').attr('data-rel');

      // Show Previous 
      var $container = $('.image_player[data-rel='+type+']');

      // Cur visible
      var all = $container.find('.anim_svg');
      var cur = $container.find('.anim_svg:visible');
      
      var all_index = all.length-1;
      var next_index;

      // Get the index of the current one
      for(var i=0;i<all.length;i++) {
         if($(all[i]).attr('id')==$(cur).attr('id')) {
            cur_index = i;
            break;
         }
      } 

      if(cur_index==all_index) {
         next_index = 0
      } else {
         next_index = cur_index + 1
      }

      // We hide it
      cur.hide(); 

      // We show the Next one
      $(all[next_index]).show();
      update_title_date($(all[next_index]).attr('id'));
      update_current_state_data(next_index,type);
   });


   // Init First State val 
   // => Last one of default_anim_view
   var data_array = window[default_anim_view+'_vals']; 
   update_current_state_data(data_array.length-1,default_anim_view);
})
