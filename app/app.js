'use strict';

angular.module('app', ['facebook', 'app.filters', 'ngRoute'])
    .run(function ($rootScope, $location, $anchorScroll, $routeParams) {
        //when the route is changed scroll to the proper element.
        $rootScope.$on('$routeChangeSuccess', function (newRoute, oldRoute) {
            $location.hash($routeParams.scrollTo);
            $anchorScroll();
        });
    })

.config(['FacebookProvider', '$routeProvider', function (FacebookProvider, $routeProvider) {
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
    .factory('page', ['Facebook', function (Facebook) {
        //page object containing all the info for the fb page//
        var page = {};
        page.pageId = 'markpeabodycustombuilder';
        //to check on the facebook api being ready //
        page.facebookReady = false;

        //what tabs are available, i.e home, about, contact
        page.pageIndex = 0;
        page.tabs = {};
        page.tabs.gallery = false;
        page.tabs.events = false;
        page.token = '1427747097519995|85GJFSbBD6WbpVoF8EZavlLWKUE';
        page.gallery = [];

        // get all the main content needed in one call //
        page.loadMainContent = function () {
            Facebook.api(page.pageId + '?fields=cover,name,feed,phone,about,emails,current_location,description,company_overview,hours,price_range,photos{picture,album}, albums', {
                access_token: page.token
            }, function (response) {
                console.log(page);
                page.name = response.name;
                page.phone = response.phone;
                page.about = response.about;
                page.emails = response.emails;
                page.currentLocation = response.current_location;
                page.locations = response.locations;
                page.description = response.description;
                page.companyOverview = response.company_overview;
                page.hours = response.hours;
                page.priceRange = response.price_range;
                page.getProfilePicture(response.photos.data[0].id);
                page.setCover(response.cover.cover_id);
                page.getAlbumCovers();

                //page.feed = response.feed;
                console.log(response);
            });
        };

        page.getAlbumCovers = function () {
            Facebook.api(page.pageId + '?fields=albums{cover_photo{images},description,name}', {
                access_token: page.token
            }, function (response) {
                page.AlbumCovers = response;
                console.log(response);
            });
        };
        page.getAlbumImages = function (albumID) {
            Facebook.api(albumID + '?fields=photos{images, name, description}', {
                access_token: page.token
            }, function (response) {
                page.AlbumImages = response;
            });
        };

        page.getAllAlbums = function () {

            Facebook.api(page.pageId + '?fields=albums{photos{images,description,name}}', {
                access_token: page.token
            }, function (response) {
                page.albums = response.albums;
                page.setAlbum(0);
                console.log("setAlbum(0)");

                console.log(response);
            });
        };

        page.setAlbum = function (index) {
            page.currentAlbum = page.albums.data[index];
            page.setCurrentPhotos();
        }

        page.setCurrentPhotos = function () {
            page.currentPhotos = page.currentAlbum.photos;
            console.log(page.currentPhotos);
        }



        page.getFeed = function () {
            Facebook.api(page.pageId + '?fields=feed.limit(10)', {
                access_token: page.token
            }, function (response) {
                page.feed = response.feed;
                for (var i = 0; i < page.feed.data.length; i++) {
                    page.setObject(page.feed.data[i].object_id, page.feed.data[i].status_type, i);
                }
            });
        };

        page.getProfilePicture = function (id) {
            Facebook.api(id, {
                access_token: page.token
            }, function (response) {
                page.profilePicture = response.images[0].source;
                console.log(page.profilePicture);

            });
        };

        page.getNextPage = function () {
            Facebook.api(page.feed.paging.next.substring(31), {
                access_token: page.token
            }, function (response) {
                console.log(response);
                if (response.data.length != 0) {
                    page.feed = response;
                    for (var i = 0; i < page.feed.data.length; i++) {
                        page.setObject(page.feed.data[i].object_id, page.feed.data[i].status_type, i);
                    }
                    page.pageIndex++;
                    console.log(response);
                }
            })
        };

        page.getPreviousPage = function () {
            if (page.pageIndex > 0) {
                console.log(page.feed.paging.previous);

                Facebook.api(page.feed.paging.previous.substring(31), {
                    access_token: page.token
                }, function (response) {
                    console.log(response);

                    page.feed = response;
                    for (var i = 0; i < page.feed.data.length; i++) {
                        page.setObject(page.feed.data[i].object_id, page.feed.data[i].status_type, i);
                    }
                    page.pageIndex--;

                })
            }
        };

        page.setCover = function (coverId) {
            Facebook.api(coverId, {
                access_token: page.token
            }, function (response) {
                page.coverURL = response.images[0].source;
                page.coverURLThumb = response.images[response.images.length - 1].source;
                // console.log(response);
                // console.log(response.images[0].source);
            });
        };

        page.setObject = function (object_id, status_type, index) {
            if (status_type == 'added_photos') {
                page.setImage(object_id, index);
            }
            //  else if(status_type == 'added_video'){
            //  }
            else if (status_type == 'created_event') {
                page.setEvent(object_id, index);
            } else if (status_type == 'shared_story') {
                page.setStory(object_id, index);
            }
        };

        page.setStory = function (object_id, index) {
            if (object_id) {
                Facebook.api(object_id, {
                    access_token: page.token
                }, function (response) {
                    page.feed.data[index].imageSource = response.images[0].source;
                });
            }
        }
        page.setEvent = function (object_id, index) {
            if (object_id) {
                Facebook.api(object_id + '?fields=cover,description', {
                    access_token: page.token
                }, function (response) {
                    page.feed.data[index].message = response.description;
                    page.feed.data[index].startTime = response.startTime;
                    page.feed.data[index].imageSource = response.cover.source;
                    //console.log($scope.feed.data[index].imageSource);
                });
            } else {
                page.feed.data[index].imageSource = null;
            }
        }

        page.setImage = function (object_id, index) {
            //console.log(post);
            if (object_id) {
                Facebook.api(object_id, {
                    access_token: page.token
                }, function (response) {
                    page.feed.data[index].imageSource = response.images[0].source;
                    page.feed.data[index].imageThumbSource = response.images[response.images.length - 1].source;
                    console.log(page.feed.data[index].imageThumbSource)
                        // console.log(page.feed.data[index].imageSource);
                });
            } else {
                // page.feed.data[index].imageSource = null;
            }
        };

        return page;

                    }])
    .controller('feedCtrl', ['$scope', 'Facebook', 'page', function ($scope, Facebook, page) {

}])
    .controller('contactCtrl', ['$scope', function ($scope) {}])

.controller('appCtrl', ['$scope', '$anchorScroll', 'page', 'Facebook', '$location', function ($scope, $anchorScroll, page, Facebook, $location) {


        $scope.goto = function (id) {
            console.log(id);
            $location.hash(id);
            $anchorScroll();
        }

        $scope.page = page;
        $scope.$watch(function () {
            // This is for convenience, to notify if Facebook is loaded and ready to go.
            return Facebook.isReady();
        }, function (newVal) {
            // You might want to use this to disable/show/hide buttons and else
            $scope.page.loadMainContent();
            $scope.page.getFeed();
        });

}])
    .controller('navigationCtrl', ['$scope', function ($scope) {}])
    .controller('headerCtrl', ['$scope', 'Facebook', 'page', function ($scope, Facebook, page) {

}])

.controller('aboutCtrl', ['$scope', 'Facebook', 'page', function ($scope, Facebook, page) {

}]);

angular.module('app.filters', [])
    .filter('linebreak', function () {
        return function (text) {
            if (text)
                return text.replace(/\n/g, '<br>');
        }
    }).filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
}])
    .directive('ddTextCollapse', ['$compile', function ($compile) {

        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attrs) {

                // start collapsed
                scope.collapsed = false;

                // create the function to toggle the collapse
                scope.toggle = function () {
                    scope.collapsed = !scope.collapsed;
                };

                // wait for changes on the text
                attrs.$observe('ddTextCollapseText', function (text) {

                    // get the length from the attributes
                    var maxLength = scope.$eval(attrs.ddTextCollapseMaxLength);

                    if (text.length > maxLength) {
                        // split the text in two parts, the first always showing
                        var firstPart = String(text).substring(0, maxLength);
                        var secondPart = String(text).substring(maxLength, text.length);

                        // create some new html elements to hold the separate info
                        var firstSpan = $compile('<span>' + firstPart + '</span>')(scope);
                        var secondSpan = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                        var moreIndicatorSpan = $compile('<span ng-if="!collapsed">... </span>')(scope);
                        var lineBreak = $compile('<br ng-if="collapsed">')(scope);
                        var toggleButton = $compile('</br></br><b><span class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "...click for less" : "...click for more"}}</span></b>')(scope);

                        // remove the current contents of the element
                        // and add the new ones we created
                        element.empty();
                        element.append(firstSpan);
                        element.append(secondSpan);
                        element.append(moreIndicatorSpan);
                        element.append(lineBreak);
                        element.append(toggleButton);
                    } else {
                        element.empty();
                        element.append(text);
                    }
                });
            }
        };
}]);;