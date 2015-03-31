'use strict';

angular.module('app',['facebook','app.filters', 'ngRoute'])

.config(['FacebookProvider', '$routeProvider', function(FacebookProvider, $routeProvider){
    // configure facebook api //
    var appId = '1427747097519995';
    FacebookProvider.init(appId);
    
    //configure routes //
    $routeProvider
    // home -> feed//
    .when('/', {
        templateUrl: 'view/feed.html',
        controller: 'feedCtrl'
    })
    
    // about //
    .when('/about', {
        templateUrl: 'view/about.html',
        controller: 'aboutCtrl'
    })
    
    // contact //
    .when('/contact', {
        templateUrl: 'view/contact.html',
        controller: 'contactCtrl'
    })
    
}])
.controller('feedCtrl', ['$scope', 'Facebook', function($scope, Facebook){

     $scope.getFeed = function() {
        Facebook.api($scope.pageId + '?fields=feed.limit(10)', {access_token:$scope.token}, function(response) {
            $scope.feed = response.feed;
            for(var i = 0; i< $scope.feed.data.length; i++) {
                $scope.setContent($scope.feed.data[i].object_id, $scope.feed.data[i].status_type, i);
            }
        });
    };
    $scope.getNextPage= function(){
        Facebook.api($scope.feed.paging.next.substring(31), {access_token:$scope.token}, function(response) {
            console.log(response);
            $scope.feed = response;
            for(var i = 0; i< $scope.feed.data.length; i++) {
                $scope.setContent($scope.feed.data[i].object_id,$scope.feed.data[i].status_type, i);
            }
            console.log(response);
        })
    };
    
    $scope.getPreviousPage= function(){
        Facebook.api($scope.feed.paging.previous.split(31), {access_token:$scope.token}, function(response) {
            $scope.feed = response.feed;
            console.log(response);
        })
    };
    
    $scope.getFeed();

        
    // status_type from { mobile_status_update, created_note, added_photos, added_video, shared_story, created_group, created_event, wall_post, app_created_story, published_story, tagged_in_photo, approved_friend} //
    
    $scope.setContent = function(object_id, status_type, index) {
        if(status_type=='added_photos'){
            $scope.setImage(object_id, index);
        }
      //  else if(status_type == 'added_video'){
      //  }
        else if(status_type == 'created_event'){
            $scope.setEvent(object_id, index);
        }
        else if(status_type == 'shared_story'){
            $scope.setStory(object_id, index);
        }
    };
    
    $scope.setStory  = function(object_id, index){
        if(object_id) {
            Facebook.api(object_id, {access_token:$scope.token}, function(response){
                $scope.feed.data[index].imageSource = response.images[0].source;
            });
        }
    }
    $scope.setEvent = function(object_id, index) {
        if(object_id){
            Facebook.api(object_id + '?fields=cover,description', {access_token:$scope.token}, function(response){
                $scope.feed.data[index].message = response.description;
                $scope.feed.data[index].startTime = response.startTime;
                $scope.feed.data[index].imageSource = response.cover.source;
                //console.log($scope.feed.data[index].imageSource);
            });
        }
        else{
             $scope.feed.data[index].imageSource = null;
        }
    }
    
    $scope.setImage = function(object_id, index){
       //console.log(post);
        if(object_id){
            Facebook.api(object_id, {access_token:$scope.token}, function(response){
                $scope.feed.data[index].imageSource = response.images[0].source;
                console.log($scope.feed.data[index].imageSource);
            });
        }
        else{
             $scope.feed.data[index].imageSource = null;
        }
    }; 
}])
.controller('contactCtrl', ['$scope', function($scope){
}])

.controller('appCtrl', ['$scope', 'Facebook',function($scope, Facebook){
    $scope.pageId = '1425194534381693';
    $scope.facebookReady = false;
    $scope.tabs = {};
    $scope.tabs.gallery = false;
    $scope.tabs.events = false;
    $scope.token = '1427747097519995|85GJFSbBD6WbpVoF8EZavlLWKUE';
    
    $scope.$watch(function() {  
      // This is for convenience, to notify if Facebook is loaded and ready to go.
      return Facebook.isReady();
    }, function(newVal) {
      // You might want to use this to disable/show/hide buttons and else
        $scope.loadContent();
    });
    
    $scope.loadContent = function(){
        Facebook.api($scope.pageId, {access_token:$scope.token}, function(response){
            $scope.content = response;
            $scope.facebookReady = true;
            console.log('ready');
        });
    };
}])
.controller('navigationCtrl', ['$scope', function($scope){
}])
.controller('headerCtrl',['$scope','Facebook', function($scope, Facebook){
    
        
    $scope.$watch(function() {  
      // This is for convenience, to notify if Facebook is loaded and ready to go.
      return $scope.facebookReady;
    }, function(newVal) {
      // You might want to use this to disable/show/hide buttons and else
      if($scope.facebookReady) {$scope.loadContent();}
    });
      
    $scope.setCover = function(coverId) {
         Facebook.api(coverId, {access_token:$scope.token}, function(response) {
            $scope.coverURL = response.images[0].source;
             console.log(response.images[0].source);
        });
    };
    
    $scope.loadContent = function(){
        $scope.setCover($scope.content.cover.cover_id);
    };
}])

.controller('aboutCtrl', ['$scope', 'Facebook', function($scope, Facebook){ 
    $scope.loadContent = function(){
        Facebook.api($scope.pageId + '?fields=photos{picture,album},phone,about,emails,current_location,locations,description,company_overview,hours,price_range',{access_token: $scope.token}, function(response){
            $scope.phone = response.phone;
            $scope.about = response.about;
            $scope.emails = response.emails;
            $scope.currentLocation = response.current_location;
            $scope.locations = response.locations;
            $scope.description = response.description;
            $scope.companyOverview = response.company_overview;
            $scope.hours = response.hours;
            $scope.priceRange = response.price_range;
            console.log(response);
            $scope.getProfilePicture(response.photos.data[0].id);
        } );
    }
    $scope.getProfilePicture = function(id) {
        Facebook.api(id, {access_token: $scope.token}, function(response) {
            $scope.profilePicture = response.images[0].source;
        });
    };
    $scope.loadContent();
}]);

angular.module('app.filters', [])
  .filter('linebreak', function() {
    return function(text) {
        if(text)
            return text.replace(/\n/g, '<br>');
    }
}).filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
}]);