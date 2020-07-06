var routes = [
  // Index page
  {
    path: '/',
    url: './index.html',
    name: 'home'
  },
  {
    path: '/photo/',
    componentUrl: './pages/photo.html',
    name: 'photo'
  },
  // Login page
  {
    path: '/login/',
    componentUrl: './pages/login.html',
    name: 'login'
  },
  // Report page
  {
    path: '/report/',
    componentUrl: './pages/report.html',
    name: 'report'
  },
  // Outstock Report page
  {
    path: '/outstock_report/',
    componentUrl: './pages/outstock_report.html',
    name: 'outstock_report'
  },
  // Outstock Product page
  {
    name: 'outstock_product',
    path: '/outstock_product/:categoryid/',
    componentUrl: './pages/outstock_product.html'
  },
  {
    name: 'outstock_product_brand',
    path: '/outstock_product_brand/:categoryid/:brand/',
    componentUrl: './pages/outstock_product_brand.html'
  },
  {
    name: 'outstock_enterdata',
    path: '/outstock_enterdata/:productid/',
    componentUrl: './pages/outstock_enterdata.html'
  },
  // Inventory Report pages
  {
    path: '/inventory_report/',
    componentUrl: './pages/inventory_report.html',
    name: 'inventory_report'
  },
  {
    name: 'inventory_product',
    path: '/inventory_product/:categoryid/',
    componentUrl: './pages/inventory_product.html'
  },
  {
    name: 'inventory_product_brand',
    path: '/inventory_product_brand/:categoryid/:brand/',
    componentUrl: './pages/inventory_product_brand.html'
  },
  {
    name: 'inventory_enterdata',
    path: '/inventory_enterdata/:productid/',
    componentUrl: './pages/inventory_enterdata.html'
  },
  // Status page
  {
    path: '/status/',
    async: function (routeTo, routeFrom, resolve, reject) {
      var username = localStorage.getItem("username");
      var token = localStorage.getItem("token");
      app.request.post('http://lavie2.liveapps.top/index.php/app/status/', { username:username, token:token }, function (raw) {
        if(raw=='invalid'){
          app.dialog.alert('Phiên làm việc đã hết hạn', 'Thông báo', function(){
            resolve(
              {
                componentUrl: './pages/login.html',
                name: 'login'
              }
            );
          });
          return;
        }
        try{
          var json = JSON.parse(raw);
          resolve(
            {
              componentUrl: './pages/status.html',
              name: 'status'
            },
            {
              context: {
                fullname: localStorage.getItem("fullname"),
                loggedin: localStorage.getItem("loggedin"),
                month_summary: json.month_summary,
                workday:json.workday,
                region:localStorage.getItem("region")
              }
            }
          );
        }
        catch(e){
          app.dialog.alert(e.message, 'Báo lỗi');
          return;
        }
      },function(){
        app.dialog.alert('Vui lòng kiểm tra lại kết nối', 'Báo lỗi');
      });
    }
  },
  {
    name: 'product_brand',
    path: '/product_brand/:categoryid/:brand/',
    componentUrl: './pages/product_brand.html'
  },
  {
    name: 'product',
    path: '/product/:categoryid/',
    componentUrl: './pages/product.html'
  },
  {
    name: 'enterdata',
    path: '/enterdata/:productid/',
    componentUrl: './pages/enterdata.html'
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
