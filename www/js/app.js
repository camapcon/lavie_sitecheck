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