/**
 * Open custom window (or new tab in mobile)
 * for social sharing
 * 
 * @param {*} url 
 */
function socialWindow(url) {
   var left = (screen.width - 570) / 2;
   var top = (screen.height - 570) / 2;
   var params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left;
   window.open(url,"NewWindow",params);
}

/**
 * Setup Social Share links based on 
 * selected state and/or county
 * 
 * @param Json data 
 */
function setShareLinks(data) {
   var pageUrl;
   var title = $("meta[property='og:description']").attr("content");
   var initUrl =  $.trim($("meta[property='og:url']").attr("content"));
 
   if(typeof data == "undefined") {
       pageUrl = document.URL;
   } else {
      if(typeof data.state !== "undefined" && typeof data.state_code !== "undefined" ) {
         title += " for " + data.state; 

         
         if(typeof data.county !== "undefined" && data.county!="") {
            // If we have a county
            pageUrl = initUrl + "?" + data.state_code + "+" + data.county;
         } else {
            // If we have a just a state 
            pageUrl = initUrl + "?" + data.state_code;
         }

      }
   }
 
   title = encodeURIComponent(title);
   pageUrl = encodeURIComponent(pageUrl);
     

   $(".social-share.facebook").unbind("click").on("click", function() {
       url = "https://www.facebook.com/sharer.php?u=" + pageUrl;
       socialWindow(url);
   });

   $(".social-share.twitter").unbind("click").on("click", function() {
       url = "https://twitter.com/intent/tweet?url=" + pageUrl + "&text=" + title;
       socialWindow(url);
   });

   $(".social-share.linkedin").unbind("click").on("click", function() {
       url = "https://www.linkedin.com/shareArticle?mini=true&url=" +  decodeURIComponent(pageUrl);
       socialWindow(url);
   });

   $(".social-share.reddit").unbind("click").on("click", function() {
      console.log("PAGE URL ", pageUrl);
      console.log("TITLE", title);
      url = "http://www.reddit.com/submit?url=" + pageUrl + "&title=" +  title;
      socialWindow(url);
  })
   
}  