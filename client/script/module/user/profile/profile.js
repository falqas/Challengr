/*

auth.js
sets up authorization controller

*/

angular.module('App.profile', [])

.controller('profileCtrl', ['alertService', 'authFactory', 'userFactory', 'braintreeFactory', '$scope', 's3Factory', function(alertService, authFactory, userFactory, braintreeFactory, $scope, s3Factory) {

  var self = this;
  var transactions = [];

  // on sign in, to get user name and photo
  self.getUserInfo = function(){
    self.username = localStorage.getItem('com.challengr.firstName');
    self.photoURL = localStorage.getItem('com.challengr.photoURL');
  };

  // Retreive user's information and display
  self.getUser = function () {
    self.firstName = localStorage.getItem('com.challengr.firstName');
    self.lastName = localStorage.getItem('com.challengr.lastName');
    self.email = localStorage.getItem('com.challengr.email');
    self.photoURL = localStorage.getItem('com.challengr.photoURL');
    self.location = 'San Francisco'; // temp; to be replaced with database location in future
  };

  // Update user information
  // self.updateUser = function(){

  // };

  $scope.changeProfileImg = function(element){

    $scope.$apply(function(scope) {
        var reader = new FileReader();
        var file = element.files[0];
        reader.readAsDataURL(element.files[0]);

        reader.onload = function(e) {

          // s3Factory.getSignedRequest(file)
          //   .then(function(data){
          //     console.log('success : ', data);
          //   })
          //   .catch(function(err){
          //     console.log('error : ', err);
          //   });

          var name = localStorage.getItem('com.challengr.firstName');
          name += 'profileImg'; // firstNameprofileImg

          s3Factory.updatePicture(reader.result, name)
            .then(function(data){
              // update user's information
              userFactory.updateProfilePhoto(data.imageURL)
                .then(function(data){
                  console.log('successfully update profile image');
                  // update the current photoURL from local storage
                  localStorage.setItem('com.challengr.photoURL', data.photoURL);
                  // run a digest cycle
                  // $scope.$apply();
                  alertService.addAlert('success', 'updated profile image', 'icon-checkbox');
                })
                .catch(function(err){
                  console.log('error updating profile image: ', err);
                });
            })
            .catch(function(err){
              console.log('error uploading image : ', err);
            });
        };
        

    });
  };

  // Get all transaction history for user
  self.getBilling = function(){
    braintreeFactory.getTransactions()
      .then(function(data){
        console.log('users billing transactions : ', data.transactions);
        self.transactions = data.transactions;
      })
      .catch(function(err){
        console.log('error retreiving users billing transactions...', err);
      });
  };

  // Sign user out
  self.signout = function(){
    authFactory.signout();
  };

}]);