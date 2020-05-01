function socialWindow(url) {
   var left = (screen.width - 570) / 2;
   var top = (screen.height - 570) / 2;
   var params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left;
   window.open(url,"NewWindow",params);
}

function setShareLinks(data) {
   var pageUrl, title, url, meta_desc;
  
   if(typeof data !== "undefined" && typeof data.url !== "undefined") {
      pageUrl = data.url;
   } else {
      pageUrl = encodeURIComponent(document.URL);
   }

   if(typeof data !== "undefined" && typeof data.state !== "undefined" && typeof data.state_code !== "undefined") {
      // Update Meta (? - not sure it will work for FB as they cache the meta)
      // Remove the previous state if any
      meta_desc =  $("meta[property='og:description']").attr("content");

      if(meta_desc.indexOf("for")>0) {
         meta_desc = meta_desc.substring(0, meta_desc.indexOf(" for "));
      }
 
      $("meta[property='og:description']").attr("content", meta_desc + ' for ' + data.state);
      

      // We update the page URL
      if(decodeURIComponent(pageUrl).indexOf('?')>0) {
         pageUrl = decodeURIComponent(pageUrl).substring(0,decodeURIComponent(pageUrl).indexOf('?')+1)+data.state_code;
      } else {
         pageUrl = decodeURIComponent(pageUrl) + "?" + data.state_code;
      }

      pageUrl = encodeURIComponent(pageUrl);
      
   } 
   
   title = encodeURIComponent($("meta[property='og:description']").attr("content"));
   
   //console.log("TITLE " +  title);
   
   $(".social-share.facebook").unbind("click").on("click", function() {
       url = "https://www.facebook.com/sharer.php?u=" + pageUrl;
       socialWindow(url);
   });

   $(".social-share.twitter").unbind("click").on("click", function() {
       url = "https://twitter.com/intent/tweet?url=" + pageUrl + "&text=" + title;
       socialWindow(url);
   });

   $(".social-share.linkedin").unbind("click").on("click", function() {
      var t = pageUrl;
      // Remove ? from  
      if(t.indexOf('?')>0) {
         t = t.substring(0,t.indexOf('?'));
      }  
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

$(function() {
   setShareLinks();
})