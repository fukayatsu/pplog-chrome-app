NProgress.configure({ showSpinner: false });

var sendNotification = function(title, message, iconUrl) {
  var notification = {
    type:    "basic",
    title:   title,
    message: message,
    iconUrl: iconUrl || "/image/icon_128.png"
  }
  chrome.notifications.create("", notification, function(notificationId){
  });
}

var resizeContent = function() {
  var content = document.getElementById('content');
  content.style.width  = (window.document.documentElement.clientWidth  - 16) + 'px'
  content.style.height = (window.document.documentElement.clientHeight - 16) + 'px'
}

var lastCheckedAt = new Date().getTime();
var sentNotifications = {}
var webview = null;
var autoZappingEnabled = false;

window.onresize = resizeContent;
window.onload = function() {
  resizeContent;
  webview = document.getElementById("webview");
  document.addEventListener("keydown" , function(event) {
    if (autoZappingEnabled) {
      autoZappingEnabled = false;
      return event.preventDefault();
    }

    var key = event.keyCode || event.charCode || 0;

    // whole the app
    if (event.ctrlKey || event.metaKey) {
      switch(key) {
      case 82: // Ctrl(Command) + R: reload
        webview.reload();
        break;
      case 83: // Ctrl(Command) + S: subscribe
        webview.executeScript({
          code: "document.getElementsByClassName('follow')[0].click();"
        });
        break;
      case 84: // Ctrl(Command) + T: auto reflesh
        if (!autoZappingEnabled) {
          autoZappingEnabled = true;
          webview.executeScript({
            code: "location.href = '/zapping'"
          });
        }
        break;
      }
    }

    // only on app_body
    if (event.target.id != 'app_body') { return; }
    switch(key) {
    case 70: //  F: zapping
    case 90: //  Z: zapping
      webview.executeScript({
        code: "document.getElementsByClassName('zapping-button')[0].getElementsByTagName('a')[0].click();"
      });
      break;
    case 72:// H: home
      webview.executeScript({
        code: "location.href='/';"
      });
      break;
    case 68: //  D: did read
      webview.executeScript({
        code: "document.getElementsByClassName('post-star')[0].click();"
      });
      break;
    case 78: // new button
      webview.executeScript({
        code: "document.getElementsByClassName('new-btn')[0].click();"
      });
      break;
    case 80: // P
      sendNotification('', _.sample([
        '٩( ˘ω˘ )و',
        '₍₍ (̨̡ ‾᷄⌂‾᷅)̧̢ ₎₎',
        '(εωз)',
        'ポエ＼＼\\ ٩( ˘ω˘ )و //／／ポエ',
        '₍₍ (̨̡ ˘ω˘)̧̢ ₎₎  ₍₍ (̨̡˘ω˘ )̧̢ ₎₎',
        'ヾ(*’ω’*)ﾉﾞ',
        '₍₍ (̨̡ ‾᷄⌂‾᷅)̧̢ ₎₎',
        '|˘ω˘)"',
      ]));
    break;
    // case 88: // x :debug
    // case 27; // esc
    // default:
    //   console.log(event)
    }
  });

  webview.addEventListener('newwindow', function(e) {
    e.preventDefault();
    window.open(e.targetUrl)
  });

  webview.addEventListener("loadstart", function() {
    NProgress.start();
  });

  countDownTimer = null;
  webview.addEventListener("loadstop", function() {
    NProgress.done();
    if (autoZappingEnabled) {
      var count = 1;
      clearInterval(countDownTimer);
      countDownTimer = setInterval(function() {
        if (!autoZappingEnabled) { return; }
        if (count <= 10) {
          webview.executeScript({
            // webkitTransformOriginが効かない...
            code: "button=document.getElementsByClassName('zapping-button')[0]; button.style.webkitTransformOrigin = 'center center'; button.style.WebkitTransform = 'rotate(" + count * 36 + "deg)';"
          });
          count++;
          // console.log(count);
        } else {
          clearInterval(countDownTimer);
          webview.executeScript({
            code: "document.getElementsByClassName('zapping-button')[0].getElementsByTagName('a')[0].click();"
          });
        }
      }, 1000);
    }
  });

}
