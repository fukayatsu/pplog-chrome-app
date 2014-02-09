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

chrome.notifications.onClicked.addListener(function(notificationId){
  notificationInfo = sentNotifications[notificationId];
  if (!notificationInfo) { return; }
  webview.executeScript({
    code: "location.href = '" + notificationInfo['userpath'] + "'"
  });
  chrome.app.window.current().focus();
});

var resizeContent = function() {
  var content = document.getElementById('content');
  content.style.width  = (window.document.documentElement.clientWidth  - 16) + 'px'
  content.style.height = (window.document.documentElement.clientHeight - 16) + 'px'
}

var lastCheckedAt = new Date().getTime();
var sentNotifications = {}
var webview = null;
var autoZappingEnabled = false;

var watchIndex = function() {
  sentNotifications = {}
  console.log('fetch index start ' + new Date());
  NProgress.start();
  webview.executeScript({
    code: "xmlHttp = new XMLHttpRequest(); xmlHttp.open('GET', 'https://www.pplog.net/', false); xmlHttp.send(null); xmlHttp.responseText;"
  }, function(result) {
    console.log('fetch index done' + new Date());
    NProgress.done();
    var html     = result[0];
    var posts    = $('li.user.post-index', html.replace(/src/g, 'data-src'));
    posts.each(function(){
      var post = $(this);
      var createdAt = post.find('.created-at').text().replace(/年|月/g, '/').replace(/日\(.\)/g, '')
      var timestamp = Date.parse(createdAt + " GMT+0900");
      if (timestamp < lastCheckedAt) {
        return true; // continue;
      }
      var title     = post.find('.title').text().trim()
      var image     = $(post.find('img')[0]).attr('data-src');
      var username  = $(post.find('.user-name a')[0]).text();
      var userpath  = $(post.find('.user-name a')[0]).attr('href');
      var notification = {
        type:    "basic",
        title:   username,
        message: title,
        iconUrl: "/image/icon_128.png" // TODO: load image via xhr
      }
      console.log(notification, new Date());
      chrome.notifications.create("", notification, function(notificationId){
        sentNotifications[notificationId] = {
          userpath: userpath
        }
      });
    });
    lastCheckedAt = new Date().getTime();
  });
}

var autoProgressEnabled = false;

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
  webview.addEventListener("loadstop", function() {
    NProgress.done();
    if (autoZappingEnabled) {
      setTimeout(function() {
        if (!autoZappingEnabled) { return; }
        webview.executeScript({
          code: "document.getElementsByClassName('zapping-button')[0].getElementsByTagName('a')[0].click();"
        });
      }, 10 * 1000);
    }
  });

  setInterval(watchIndex, 600 * 1000);
}
