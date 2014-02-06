NProgress.configure({ showSpinner: false });

var resize_content = function() {
  var content = document.getElementById('content');
  content.style.width  = (window.document.documentElement.clientWidth  - 16) + 'px'
  content.style.height = (window.document.documentElement.clientHeight - 16) + 'px'
}

window.onload   = function() {
  resize_content;
  var webview = document.getElementById("webview");
  document.addEventListener("keydown" , function(event) {
    var key = event.keyCode || event.charCode || 0;
    if (!event.ctrlKey && !event.metaKey) { return; }

    switch(key) {
      //  R: reload
      case 82: webview.reload(); break;
      //  F: zapping
      case 70: webview.executeScript({ code: "location.pathname = '/zapping';" }); break;
      //  D: did read
      case 68:
        NProgress.start();
        webview.executeScript({
          code: "document.getElementsByClassName('post-star')[0].click();"
        }, function(result) {
          NProgress.done();
        });
        break;
    }
  });

  webview.addEventListener('newwindow', function(e) {
    e.preventDefault();
    window.open(e.targetUrl)
  });

  webview.addEventListener("loadstart", NProgress.start);
  webview.addEventListener("loadstop", NProgress.done);

}
window.onresize = resize_content;
