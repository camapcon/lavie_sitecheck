// Dom7
var $ = Dom7;

var lat = '';
var lng = '';

// Theme
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

// Init App
var app = new Framework7({
  id: 'com.lavie.pgapp2',
  root: '#app',
  init: false,
  theme: theme,
  calendar: {
    dateFormat: 'yyyy-mm-dd'
  },
  touch: {
    fastClicks: true
  },
  data: function () {
    return {
      preload: {},
      checkin: '',
      checkout: ''
    };
  },
  methods: {
    checkin: function () {
      app.panel.close();
      var router = app.router;
      var token = localStorage.getItem("token");
      if(app.data.checkin!=''){
        app.dialog.alert('Bạn đã checkin hôm nay rồi', 'Thông báo');
        return;
      }
      navigator.camera.getPicture(function(fileURI){
        var options = new FileUploadOptions();
        options.fileKey = "photo";
        options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.headers = { Connection: "close", token:token, lat:lat, lng:lng };
        options.httpMethod="POST";
        options.chunkedMode=false;
        var ft = new FileTransfer();
        ft.upload(fileURI, encodeURI("http://lavie2.liveapps.top/index.php/app/checkin"), function(raw){
          app.dialog.close();
          if(raw.response=='invalid'){
            app.dialog.alert('Phiên làm việc đã hết hạn', 'Báo lỗi', function(){
              router.navigate('/login/', {reloadAll:true, ignoreCache:true});
            });
            return;
          }
          if(raw.response=='failed'){
            app.dialog.alert('Không gửi được hình chụp từ Camera', 'Báo lỗi');
            return;
          }
          if(raw.response=='already'){
            app.dialog.alert('Bạn đã checkin hôm nay rồi', 'Thông báo');
            return;
          }
          app.dialog.alert('Ghi nhận lúc ' + raw.response, 'Checkin thành công', function(){
            router.navigate('/status/', {reloadAll:true, reloadCurrent: true, ignoreCache:true});
          });
        }, function(error){
          app.dialog.close();
          app.dialog.alert('Không gửi được hình chụp từ Camera (' + error.code + ')', 'Báo lỗi');
        }, options);
        app.dialog.preloader('Đang gửi hình');
      }, function(message) {
       app.dialog.alert(message, 'Báo lỗi');
       }, {
         quality: 50,
         correctOrientation: true,
         destinationType: navigator.camera.DestinationType.FILE_URI,
         sourceType: Camera.PictureSourceType.CAMERA
      });
    },
    checkout: function () {
      app.panel.close();
      var router = app.router;
      var token = localStorage.getItem("token");
      if(app.data.checkin==''){
        app.dialog.alert('Bạn vẫn chưa checkin hôm nay', 'Thông báo');
        return;
      }
      if(app.data.checkout!=''){
        app.dialog.alert('Bạn đã checkout hôm nay rồi', 'Thông báo');
        return;
      }
      app.request.post('http://lavie2.liveapps.top/index.php/app/checkout/', { token:token }, function (raw) {
        if(raw=='invalid'){
          app.dialog.alert('Phiên làm việc đã hết hạn', 'Báo lỗi', function(){
            router.navigate('/login/', {reloadAll:true, ignoreCache:true});
          });
          return;
        }
        try{
          var json = JSON.parse(raw);
          if(json.result=='success'){
            app.dialog.alert('Ghi nhận lúc ' + json.checkout, 'Checkout thành công', function(){
              router.navigate('/status/', {reloadAll:true, reloadCurrent: true, ignoreCache:true});
            });
          }
          if(json.result=='nocheckin'){
            app.dialog.alert('Bạn vẫn chưa checkin hôm nay', 'Thông báo');
          }
          if(json.result=='already'){
            app.dialog.alert('Bạn đã checkout hôm nay rồi', 'Thông báo');
          }
        }
        catch(e){
          app.dialog.alert(e.message, 'Báo lỗi');
          return;
        }
      },function(){
        app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
      });
    },
    logout: function(){
      app.panel.close();
      localStorage.removeItem("token");
      app.router.navigate('/login/', {reloadAll:true, ignoreCache:true});
    }
  },
  routes: routes,
  vi: {
    placementId: 'pltd4o7ibb9rc653x14',
  },
});

var mainView = app.views.create('.view-main');
var token = localStorage.getItem("token");
if(token){
  mainView.router.navigate('/status/');
}
else{
  mainView.router.navigate('/login/', {reloadAll:true, ignoreCache:true});
}

$(document).on('page:init', function (e) {
  // Page Data contains all required information about loaded and initialized page
  var page = e.detail;
  if(page.name != 'login')
    $('.navbar').show();
});

$(document).on('page:init', '.page[data-name="login"]', function (e) {
  $('.navbar').hide();
});

app.init();

//preload some data
app.request.post('http://lavie2.liveapps.top/index.php/app/allproducts', {}, function (raw) {
  try{
    var json = JSON.parse(raw);
    window.localStorage.setItem("preload", json);
    app.data.preload = json;
  }
  catch(e){
    app.dialog.alert(e.message, 'Báo lỗi');
    return;
  }
},function(xhr, status){
  app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
  //app.dialog.alert(JSON.stringify(xhr), status);
});

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {  
  navigator.geolocation.getCurrentPosition(function(position) {
      lat = position.coords.latitude;
      lng = position.coords.longitude;
  }, function(error) {
      app.dialog.alert('Không thể xác định vị trí của bạn', 'Lỗi GPS');
  });
}

function base64_encode (stringToEncode) { // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/base64_encode/
  // original by: Tyler Akins (https://rumkin.com)
  // improved by: Bayron Guevara
  // improved by: Thunder.m
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Rafał Kukawski (https://blog.kukawski.pl)
  // bugfixed by: Pellentesque Malesuada
  // improved by: Indigo744
  //   example 1: base64_encode('Kevin van Zonneveld')
  //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
  //   example 2: base64_encode('a')
  //   returns 2: 'YQ=='
  //   example 3: base64_encode('✓ à la mode')
  //   returns 3: '4pyTIMOgIGxhIG1vZGU='

  // encodeUTF8string()
  // Internal function to encode properly UTF8 string
  // Adapted from Solution #1 at https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  var encodeUTF8string = function (str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into the base64 encoding algorithm.
    return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes (match, p1) {
        return String.fromCharCode('0x' + p1)
      })
  }

  if (typeof window !== 'undefined') {
    if (typeof window.btoa !== 'undefined') {
      return window.btoa(encodeUTF8string(stringToEncode))
    }
  } else {
    return new Buffer(stringToEncode).toString('base64')
  }

  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var o1
  var o2
  var o3
  var h1
  var h2
  var h3
  var h4
  var bits
  var i = 0
  var ac = 0
  var enc = ''
  var tmpArr = []

  if (!stringToEncode) {
    return stringToEncode
  }

  stringToEncode = encodeUTF8string(stringToEncode)

  do {
    // pack three octets into four hexets
    o1 = stringToEncode.charCodeAt(i++)
    o2 = stringToEncode.charCodeAt(i++)
    o3 = stringToEncode.charCodeAt(i++)

    bits = o1 << 16 | o2 << 8 | o3

    h1 = bits >> 18 & 0x3f
    h2 = bits >> 12 & 0x3f
    h3 = bits >> 6 & 0x3f
    h4 = bits & 0x3f

    // use hexets to index into b64, and append result to encoded string
    tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
  } while (i < stringToEncode.length)

  enc = tmpArr.join('')

  var r = stringToEncode.length % 3

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
}

function _encode(str){
    var output = base64_encode(str);
    output = output.replace(/\+/g, '-');
    output = output.replace(/\//g, '_');
    output = output.replace(/=/g, '');
    return output;
}