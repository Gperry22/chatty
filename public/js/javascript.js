console.log("App Running");


  var firebaseConfig = {
    apiKey: "AIzaSyDL7X67L0Gcil8zzP6huH9pyVFXpmMDQwE",
    authDomain: "chatty-2206b.firebaseapp.com",
    databaseURL: "https://chatty-2206b.firebaseio.com",
    projectId: "chatty-2206b",
    storageBucket: "chatty-2206b.appspot.com",
    messagingSenderId: "573114905403",
    appId: "1:573114905403:web:3327eb9cdff2f8a4"
  };
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();

function googleSignIn() {
   firebase.auth()

   .signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;

      console.log(token)
      console.log(user)
      $("#signIn").css("display", "none");
   }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      console.log(error.code)
      console.log(error.message)
   });
}

function googleSignOut() {
   firebase.auth().signOut()

   .then(function() {
      console.log('Signout Successful')
      $("#signIn").css("display", "");
   }, function(error) {
      console.log('Signout Failed')
   });
}
