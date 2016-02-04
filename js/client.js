
var RACES;
var WEB_API;
var LOCAL_TESTING = false; 
//if (window.location.href.indexOf('austrian') > 0 || LOCAL_TESTING == false)
    WEB_API = 'https://0ro19k4iz0.execute-api.us-east-1.amazonaws.com/prod';
//else
//    WEB_API = '/commands';
var USER_INFO;
var ROOT;
var AngApp = angular.module('Elections', ['ngRoute', 'ngSanitize', 'ngDialog']);


AngApp.factory('$exceptionHandler', function () {
    return function errorCatcherHandler(exception, cause) {
        var obj = {};
        obj.Exception = exception;
        obj.Cause = cause;
        obj.StackTrace = exception.stack;
        obj.URL = window.location.href;
        console.log(JSON.stringify(obj));
    };
});

AngApp.run(['$rootScope', '$http', '$location', function ($rootScope, $http, $location) {
        ROOT = $rootScope;
        ROOT.Log = "";
        $.fn.dataTableExt.sErrMode = 'throw';
        $rootScope.$on("$locationChangeStart", function (event, next, current) { });

    }]);

AngApp.config(['$routeProvider', function ($routeProvider) {
        
        $routeProvider.when('/home', {
            templateUrl: "Home",
            controller: 'CtrlHome'
        })
        .when('/contact',
       {
            templateUrl: "Contact",
            controller: 'CtrlContact'
        })
        .when('/candidates',
        {
            templateUrl: "AllRaces",
            controller: 'CtrlCandidates'
        }).when('/userSettings',
        {
            templateUrl: "MySettings",
            controller: 'CtrlMySettings'
        })
        .when('/about',
       {
            templateUrl: "About",
            controller: 'CtrlAbout'
        })
        .otherwise({
            redirectTo: '/home'
        });
    }]);


AngApp.controller('MainCtrl', ['$scope', '$route', '$http', '$location', '$window', 'ngDialog',
    function ($scope, $route, $http, $location, $window, ngDialog) {
        MAIN_SCOPE = $scope;
        $scope.UserLoggedIn = false;
        $scope.logout = function () {
            if ($scope.UserInfo.LoginType == "FB") {
                FB.logout(function (response) {
                    $scope.UserLoggedIn = false;
                    $scope.$apply();
                });
            }
            else {
                var auth2 = gapi.auth2.getAuthInstance();
                auth2.signOut().then(function () {
                    $scope.UserLoggedIn = false;
                    $scope.$apply();
                });
            }
        };
        
        
        $scope.FBLogin = function () { 
        
               FB.login(function (response) {
                $window.FaceBookLogin();
            });
        
        
        }

        $scope.ShowCandidateInfo = function () {
            ngDialog.open({
                template: 'CandidateInfo',
                controller: ['$scope', function ($scope) {
                        
                        $scope.user = CURRENT_USER;
                        if ($scope.user.info.website != null) { 
                        
                            if ($scope.user.info.website.indexOf('http') < 0) {       
                                $scope.weblink = "http://" + $scope.user.info.website;
                            }
                            else {
                                $scope.weblink = $scope.user.info.website;
                            }
                        }

                    }]
            });
        };


        $scope.DisplayWaitBanner = function () {
            $scope.ShowWaitBanner = true;
        }
        $scope.HideWaitBanner = function () {       
            $scope.ShowWaitBanner = false;
        }

       
    }
]).controller('CtrlAbout',

   ['$scope', '$http',
    function ($scope, $http) {
        $scope.Page = 'About';
    }]
).controller('CtrlContact',
   ['$scope', '$http', 

    function ($scope, $http) {
        $scope.Page = 'Contact';
    
    }]

).controller('CtrlMySettings',

   ['$scope', '$http', '$location',

    function ($scope, $http, $location) {
        HTTP = $http;
        
        if (USER_INFO == null) {
            $location.path('/home');
            return;
        }
        
        $scope.States = [];

        var myOpts = document.getElementById('States').options;
        
        for (var i = 0; i < myOpts.length; i++) {
            $scope.States.push({ text: myOpts[i].text, value: myOpts[i].value });
        }
        
        


        $scope.Page = 'MySettings';
        $scope.UserInfo = USER_INFO;
        
        if ($scope.UserInfo.info.interest == null)
            $scope.UserInfo.info.interest = "0";
        
        if ($scope.UserInfo.info.RaceType == null)
            $scope.UserInfo.info.RaceType = "none";

        
        if ($scope.UserInfo.race_id != "none") {
            
            $scope.RaceType = $scope.UserInfo.race_id.substring(0, 1);
            $scope.RaceState = $scope.UserInfo.race_id.substring(2, 4);
            $scope.RaceDistrict = $scope.UserInfo.race_id.substring(5, 7);

        }
        else {
            $scope.RaceType = "none";      
        }
        
        $scope.UpdateChoices = function () {
            
            if (RACES == null) return;
            
            if ($scope.RaceType == "S") {             
                $('#States').find('option').remove().end();               
                var x = document.getElementById("States");
               
                var options = [];
                for (var state in RACES.SenateRaces) {
                    var st = Enumerable.From($scope.States).Where("$.value == '" + state + "'").FirstOrDefault();
                    var option = document.createElement("option");
                    option.text = st.text;
                    option.value = st.value;
                    options.push(option);
                }

                options = Enumerable.From(options).OrderBy("$.text").ToArray();
                options.forEach(function (item) { x.add(item); });

                $('#States').val($scope.RaceState);
              
            }
           

            if ($scope.RaceType == 'H' || $scope.RaceType == 'S') {
                $scope.districts = Enumerable.From(RACES).Where("$.state == '" + $scope.RaceState + "'").Select("$.district").ToArray().sort();
            }

           

        };
        
        $scope.$watchGroup(['RaceType', 'RaceState'], function (old, ne) {
            
            $scope.UpdateChoices();

        });
        
        
        if (RACES == null) {
            _COMMAND("GetData", null, function (response) {
                
                if (response.status != 0) {
                    console.log(data.errorMessage);
                }
                else {
                    PrepareData(response.data);
                    $scope.UpdateChoices();
                }
            });
        }
        else
            $scope.UpdateChoices();
        
        $scope.CloseAccount = function () { 
        
            if (confirm("Are you sure you want to delete your account?")) {

              
                _COMMAND('DeleteUser', JSON.stringify(USER_INFO), function (response) {
                    
                    if (response.status != 0) {
                        console.log(data.errorMessage);
                    }
                    else {

                        $scope.logout();
                    }
                    REFRESH_DATE = new Date('1/1/2015');
                    $location.path('/home');
                      
                });

            }
        
        }

        $scope.UpdateSettings = function () {
            var data = {};
            data.UserInfo = $scope.UserInfo;
            $scope.message = "";
            if ($scope.RaceType == 'P')
                data.UserInfo.race_id = 'P_US_00';
            else if ($scope.RaceType == 'S') {
                data.UserInfo.race_id = 'S_' + $scope.RaceState + '_00';
            }
            else if ($scope.RaceType == 'H')
                data.UserInfo.race_id = 'H_' + $scope.RaceState + '_' + $scope.RaceDistrict;
            else
                data.UserInfo.race_id = "none";
            
            
            DynamoDBRemoveEmpty(data);

            _COMMAND('UpdateUser', JSON.stringify(data), function (response) {
                
                if (response.status != 0) {
                    console.log(data.errorMessage);
                }
                else {
                    $scope.message = "Profile updated.";
                    REFRESH_DATE = new Date('1/1/2015');
                }
                      
            });
        }
    }]
).controller('CtrlCandidates',

 ['$scope', '$route', '$http', '$location', '$window', 'ngDialog',
    CtrlCandidates
]).controller('CtrlHome',

 ['$scope', '$http',
    function ($scope, $http) {
        $scope.Page = 'Contact';
    
    }
]);


//CtrlHome

function _POST2(http, _url, _data, next) {
    http({
        method: 'POST',
        url: _url,
        data: _data,
        headers: {
            'Content-Type': 'application/json'
        }
    }).
    success(function (data, status, headers, config) {
        
        next(data);
    }).
    error(function (data, status, headers, config) {
        
        throw new Error('bad post');
    });

}


function _COMMAND(cmdName, data, next) {
    var cmd = {};
    cmd.cmd = cmdName;
    cmd.data = data;
    _POST2(HTTP, WEB_API, cmd, next);
}

function DynamoDBRemoveEmpty(data) { 


    iterate(data, function (obj, prop) {
        
        var val = obj[prop];
        if (val == null || val.toString().length == 0)
            delete obj[prop];    
    });


}




function iterate(obj , todo) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object")
                iterate(obj[property], todo);
            else
                todo(obj, property);
        }
    }
}
