function socialWindow(url) {
   var left = (screen.width - 570) / 2;
   var top = (screen.height - 570) / 2;
   var params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left;
   window.open(url,"NewWindow",params);
}

function setShareLinks(data) {
   var pageUrl, title, url;
  
   if(typeof data !== "undefined" && typeof data.url !== "undefined") {
      pageUrl = data.url;
   } else {
      pageUrl = encodeURIComponent(document.URL);
   }

   if(typeof data !== "undefined" && typeof data.state !== "undefined") {
      // Update Meta (? - not sure it will work for FB as they cache the meta)
      $("meta[property='og:description']").attr("content",$("meta[property='og:description']").attr("content")+ ' for ' + data.state);
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
       url = "https://www.linkedin.com/shareArticle?mini=true&url=" + pageUrl;
       socialWindow(url);
   });

   $(".social-share.reddit").unbind("click").on("click", function() {
      url = "http://www.reddit.com/submit?url=" + pageUrl + "&title=" + encodeURIComponent(document.title);
      socialWindow(url);
  })
}

function updateDocumentUrl(state,county) {
   var data = {};
   if(typeof state!="undefined" && state != "") {
      data.state = state;
   }
   if(typeof county!="undefined" && county != "") {
      data.county = county;
   }
   setShareLinks(data);
}


$(function() {
   setShareLinks();
})