var playing_inter; // Interval
var cur_index;
var max_index;


// Update Date in title based
function update_title_date(id) {
   // Transform id to date & display 
   var _date = id.slice(-8);
   $('#anim_date').fadeOut(25, function() {
      $('#anim_date').text(_date.substring(0,4)+"-"+_date.substring(4,6)+"-"+_date.substring(6,10));
      $('#anim_date').fadeIn(100);
   });

}

// Update Current State Date (total value)
function update_current_state_data(index,type) {
   var data_array = window[type+'_vals']; 
   $('#cur_type_val').text(data_array[index]);
}
 

// Start playing
function anim_play(type, dir, the_cur_index) {
   var $container = $('.image_player[data-rel='+type+']');

   // Cur visible
   var all = $container.find('.anim_svg');
   var cur = $container.find('.anim_svg:visible');
   
   var all_index = all.length-1;
   var next_index;

   // Get the index of the current one
   if(the_cur_index==-1) {
      for(var i=0;i<all.length;i++) {
         if($(all[i]).attr('id')==$(cur).attr('id')) {
            cur_index = i;
            break;
         }
      } 
    }

   if(dir=="next") {
      if(cur_index==all_index) {
         next_index = 0
      } else {
         next_index = cur_index + 1
      }
   } else {
      if(cur_index==0) {
         next_index = all_index
      } else {
         next_index = cur_index - 1
      }
   }
   

   // We hide it
   cur.hide(); 

   // Update main index
   cur_index = next_index;

   // We show the Next one
   $(all[next_index]).show(); 
   update_title_date($(all[next_index]).attr('id'));
   update_current_state_data(next_index,type);

}
 

function change_type(new_type) {
      // Update string of cur_type_st
      $('#cur_type_st').text($('#anim_selector option:selected').text());
 
      // We hide all the types
      $('.image_player').css('display','none');
      $('.anim_svg').css('display','none');
        

      $('.image_player[data-rel='+new_type+']').css('display','block');
      // We display the cur_index one
      var all_anim = $('.image_player[data-rel='+new_type+'] .anim_svg'); 
      $(all_anim[cur_index]).css('display','block');

      // We update the value 
      update_current_state_data(cur_index,new_type);
      
      // We update the date 
      update_title_date($(all_anim[cur_index]).attr('id'));
}



function init_anim_selector() {
   

   $('#anim_selector').change(function() {
      
      var new_type = $('#anim_selector').val();
 
      // If playing, we pause
      clearInterval(playing_inter);
      $('.btn-anim.m').removeClass('btn-pause').addClass('btn-play').attr('disabled','disable');
 
      // We test if the new type is on the page
      if($('.image_player[data-rel='+new_type+']').length==0) {
         // cur_state  is defined on the page
         var path_to_the_data = "../states/" + cur_state  + '-data/' + new_type + ".html";

         // We show the loading stuff
         $('<div class="loading"><div></div></div>').appendTo($('.image_player:visible'));

         // We get the content
         $.ajax({
            url: path_to_the_data,
            success: function(result){
               $("#state_level").append($(result));
               change_type(new_type);
               $('.loading').remove();
               init_all_actions();
         }});
       


      } else {
         change_type(new_type);
      }
 
      
 
   });

}


function init_all_actions() {

   $('.btn-anim.m').unbind('click').click(function(e) {
      e.stopPropagation();
   
      var type = $(this).closest('.image_player').attr('data-rel');
   
      if($(this).hasClass('btn-play')) {
         $(this).removeClass('btn-play').addClass('btn-pause');
         playing_inter = setInterval(function(){  anim_play(type,'next'); }, 500);
      } else {
         $(this).removeClass('btn-pause').addClass('btn-play');
         clearInterval(playing_inter);
      }
      return false;
   });


   // Backward
   $('.btn-backward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      anim_play(new_type,'prev',-1);
   });


    // Forward
    $('.btn-forward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      anim_play(new_type,'next',-1);
   });


   // FastBackward
   $('.btn-fastbackward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      cur_index = 1
      anim_play(new_type,'prev',cur_index);
   });
   
   
   // Forward
   $('.btn-fastforward').unbind('click').click(function(e) {
      var new_type = $('#anim_selector').val();
      cur_index = max_index -1
      anim_play(new_type,'next',cur_index);
   });
   
}



$(function() {

   // Init Cur_index
    
      var data_array = window[default_anim_view+'_vals'];  
      cur_index = data_array.length-1;  
      max_index = cur_index;
   
      // Init First State val 
      // => Last one of default_anim_view
      update_current_state_data(data_array.length-1,default_anim_view);
   
      init_anim_selector();
      init_all_actions(); 

   
})
