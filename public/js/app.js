'use strict';
var bank = angular.module('bank',['ngResource','ngRoute','ngCookies']);
var selectedFromCountry;
var selectedToCountry;
var transcationId;
var selectedAccount;
var filename;

/*****----dummy user name----*****/
var userid;

bank.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }]);


bank.config(['$routeProvider','$locationProvider', function ($routeProvider, $locationProvider){

	$routeProvider
	.when('/login', {
		controller: 'logincontroller',
		templateUrl: 'modules/authentication/views/login.html',
		hideMenus: true
	})
	.when('/transfer', {
		controller: 'transfercontroller',
		templateUrl: 'modules/home/views/uploaddetails.html'
	})
	.when('/tranferReq', {
		controller: 'tranferreqcontroller',
		templateUrl: 'modules/home/views/TransferRquest.html'
	})
	.when('/reviewdetail', {
		controller: 'reviewdetailcontroller',
		templateUrl: 'modules/home/views/reviewdetail.html'
	})
	.when('/confirmdetail', {
		controller: 'confirmdetailcontroller',
		templateUrl: 'modules/home/views/confirmdetails.html'
	})
	.when('/', {
		controller: 'logincontroller',
		templateUrl: 'modules/authentication/views/login.html'
	})

	.otherwise({ redirectTo: '/login' });

}]);


bank.service("transferService", function() {
	var instance = this;
	var transferData = [];

	instance.getData = function () {
		return transferData;
	}

	instance.setData = function(data) {
		// TODO validate data before storing
		transferData = data;    
	}
});

bank.controller('logincontroller', ['$scope','$http','$resource','$location','AuthenticationService', function($scope,$http,$resource,$location,AuthenticationService){
	$scope.login = function() {
		/*    	$http({
            method: "POST",
            url: "/api/LoginCheck",
            header: {
                'Content-Type': "application/json",
                'Access-Control-Allow-Headers': "Content-Type",
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Origin': '*'
            },
            data: "{\"username\":\""+$scope.username+"\",\"password\":\""+$scope.password+"\"}"
        }).success(function(data) {
            if(data.loginStatus==="success"){
//			alert("Success");
            	AuthenticationService.SetCredentials($scope.username, $scope.password);
		userid=$scope.username;
		$location.path('/globaltransfer');
		}else {
			alert("Invalid Username/Password. Please try again.");
		    $location.path('/login');
		}
        }).error(function(error) {
           alert("Network Connection failed"); 
        });	
		 */    	
		//To Bypass Login
		if ($scope.username==="nextgen"&&$scope.password==="nextgen"){
			AuthenticationService.SetCredentials($scope.username, $scope.password);
			userid=$scope.username;
			$location.path('/transfer');
		}else
		{
			alert("Invalid Username/Password. Please try again.");
			$location.path('/login');
		}
	};
	AuthenticationService.ClearCredentials();
}]);

bank.controller('transfercontroller', ['$scope','$http','$resource','$location', function($scope,$http,$resource,$location){
	$scope.userID = userid;
	$scope.countries = [];
	$scope.fromcountries = [];
	$scope.tocountries = [];
	$scope.tobankaccounts = [];

//	$http.get('http://genericbankcloudant.mybluemix.net/api/Accounts/').success(function(data) {
	$http.get('json/Accounts.json').success(function(data) {
		
		//console.log(JSON.stringify(data));
		//console.dir($scope.mycheck)
		for(var i = 0; i < data.body.length; i++) {
			var item = data.body[i]
			if(item.customerNo == userid) {
				$scope.tobankaccounts.push(item);
				
			}
		};
	});

	$scope.transferTo = function(){
		//alert($scope.toaccount.accountNo)
		selectedAccount = $scope.toaccount;
		filename=$scope.mycheck;
		console.dir($scope.mycheck);
		$location.path('/reviewdetail');
	}
}]);

bank.controller('tranferreqcontroller', ['$scope','$http','$resource','$location', 'transferService',
                                         function($scope,$http,$resource,$location, transferService){

	$scope.frombankaccts = [];
	$scope.tobankaccts = [];
	$scope.tfromcurrency = [];
	$scope.ttocurrency = [];
	$scope.globalTransfer = {transfernow : "Transfer Now"};
	//$scope.fromcountryname = selectedFromCountry;
	$scope.tocountryname = selectedToCountry;
	//console.log(selectedFromCountry + "  .... "+ selectedToCountry);
	$http.get('http://genericbankcloudant.mybluemix.net/api/Accounts/').success(function(data) {
		//$http.get('json/accts.json').success(function(data) {
		for(var i = 0; i < data.body.length; i++) {
			var elem = data.body[i]
			if(elem.countryCode == selectedFromCountry) {
				if(elem.customerNo == userid) {
					$scope.frombankaccts.push(elem)
				}
			}
			if(elem.countryCode == selectedToCountry) {
				if(elem.customerNo == userid) {
					$scope.tobankaccts.push(elem)
				}
			}
		};

		// Setting default value
		if($scope.frombankaccts.length > 0) {
			$scope.globalTransfer.fromaccount = $scope.frombankaccts[0];
		}
		// Setting default value
		if($scope.tobankaccts.length > 0) {
			$scope.globalTransfer.toaccount = $scope.tobankaccts[0];
		}
	});

	$http.get('http://genericbankcloudant.mybluemix.net/api/Country').success(function(data) {
		//$http.get('json/currencies.json').success(function(data) {
		for(var i = 0; i < data.body.length; i++) {
			var elem = data.body[i]
			if(elem.countryCode == selectedFromCountry) {
				$scope.tfromcurrency.push(elem);
			}
			if(elem.countryCode == selectedToCountry) {
				$scope.ttocurrency.push(elem);
			}
		};
		// Setting default value
		if($scope.tfromcurrency.length > 0) {
			$scope.globalTransfer.transferfromcurrency = $scope.tfromcurrency[0];
		}
		// Setting default value
		if($scope.ttocurrency.length > 0) {
			$scope.globalTransfer.transfertocurrency = $scope.ttocurrency[0];
		}
	});

	$scope.transferForm = function(transferData){
		transferService.setData(transferData);
		
		$location.path('/reviewdetail');
	}

}]);

bank.controller('reviewdetailcontroller', ['$scope','$http','$resource','$location', 'transferService', 
                                           function($scope,$http,$resource,$location, transferService){
	$scope.toaccount = selectedAccount;
	$scope.reviewData = transferService.getData() || [];
	$scope.filesend = filename;
	//console.log(JSON.stringify(selectedAccount));

	$scope.goConfirm = function() {
        var fd = new FormData();
        fd.append('file', $scope.filesend);
        
        
		var parsedData = {
				"file": $scope.filesend,//reviewData.mycheck,
				"toAccountNo": $scope.toaccount.accountNo
				
		};
		// console.log(parsedData);
		/*$http({
			method: "POST",
			url: "http://fundtransferapplication.mybluemix.net/api/favorites/attach",
			header: {
				'Content-Type': "text/plain",//'Content-Type': "application/json",
				'Access-Control-Allow-Headers': "Content-Type",
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Origin': '*'
			},
			data: parsedData*/
		
		//$http.post("http://fundtransferapplication.mybluemix.net/api/favorites/attach", fd, {
		$http.post("/writeFileToCloudant", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
		}).success(function(data) {
			console.log("Success");
			transcationId = data;
			$location.path('/confirmdetail');
		}).error(function(error) {
			//For Testing purpose only
			console.log("Other");
			transcationId = "420";
			$location.path('/confirmdetail');

		});
	}
}]);

bank.controller('confirmdetailcontroller', ['$scope','$http','$resource','$location', function($scope,$http,$resource,$location, transferService ){
	//console.log(transcationId);
	$scope.transferId = transcationId;

}]);

bank.controller('bankcontroller', ['$scope','$http','$resource','$location', function($scope,$http,$resource,$location){

}]);

bank.run(['$rootScope', '$location', '$cookieStore',
          function ($rootScope, $location, $cookieStore) {
	// keep user logged in after page refresh
	$rootScope.globals = $cookieStore.get('globals') || {};
//	if ($rootScope.globals.currentUser) {
//	$http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
//	}

	$rootScope.$on('$locationChangeStart', function (event, next, current) {
		// redirect to login page if not logged in
		if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
			$location.path('/login');
		}
	});
}]);


bank.factory('AuthenticationService',
		['Base64','$cookieStore', '$rootScope',
		 function (Base64,$cookieStore, $rootScope) {
			var service = {};

			service.SetCredentials = function (username, password) {
				var authdata = Base64.encode(username + ':' + password);

				$rootScope.globals = {
						currentUser: {
							username: username,
							authdata: authdata
						}
				};

//				$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
				$cookieStore.put('globals', $rootScope.globals);
			};

			service.ClearCredentials = function () {
				$rootScope.globals = {};
				$cookieStore.remove('globals');
//				$http.defaults.headers.common.Authorization = 'Basic ';
			};

			return service;
		}]);

bank.factory('Base64', function () {
	/* jshint ignore:start */

	var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	return {
		encode: function (input) {
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;

			do {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
				keyStr.charAt(enc1) +
				keyStr.charAt(enc2) +
				keyStr.charAt(enc3) +
				keyStr.charAt(enc4);
				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";
			} while (i < input.length);

			return output;
		},

		decode: function (input) {
			var output = "";
			var chr1, chr2, chr3 = "";
			var enc1, enc2, enc3, enc4 = "";
			var i = 0;

			// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
			var base64test = /[^A-Za-z0-9\+\/\=]/g;
			if (base64test.exec(input)) {
				window.alert("There were invalid base64 characters in the input text.\n" +
						"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
				"Expect errors in decoding.");
			}
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			do {
				enc1 = keyStr.indexOf(input.charAt(i++));
				enc2 = keyStr.indexOf(input.charAt(i++));
				enc3 = keyStr.indexOf(input.charAt(i++));
				enc4 = keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}

				chr1 = chr2 = chr3 = "";
				enc1 = enc2 = enc3 = enc4 = "";

			} while (i < input.length);

			return output;
		}
	};

	/* jshint ignore:end */
});
