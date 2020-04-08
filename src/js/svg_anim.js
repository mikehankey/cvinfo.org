// Update  Date in title based
function update_title_date(id) {
   // Transform id to date & display
   var _date = id.slice(-8);
   $('#anim_date').text(_date.substring(0,4)+"-"+_date.substring(4,6)+"-"+_date.substring(6,10));
}

// Update Current State Date
function update_current_state_data(index,type) {
   var data_array = window[type+'_vals'];
   console.log(type+"_vals")
   console.log(window[type+'_vals'])
   $('#cur_state_data').text(data_array[index]);
}

// Here we get how many svg images we have per type
function anim_play(type) {
   var $container = $('.image_player[data-rel='+type+']');

   // Cur visible
   var all = $container.find('.anim_svg');
   var cur = $container.find('.anim_svg:visible');
   
   var all_index = all.length-1;
   var cur_index;
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



// Here we get how many svg images we have per type
function anim_pause(type) {
   anim_play(type);

   //var $container = $('.image_player[data-rel='+type+']');
   //var all_images = $container.find('.anim_svg');
}




$('.btn-anim').click(function(e) {
   e.stopPropagation();

   var type = $(this).closest('.image_player').attr('data-rel');

   if($(this).hasClass('btn-play')) {
      anim_pause(type);
      $(this).removeClass('btn-play').addClass('btn-pause');
   } else {
      anim_play(type);
      $(this).removeClass('btn-pause').addClass('btn-play');
   }
   return false;
});