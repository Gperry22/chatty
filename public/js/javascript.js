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
var userToken = sessionStorage.getItem("userToken")
var dbListOfUserNames = [];
var dbListOfUsersConnected = [];
var connectionsRef = firebase.database().ref("/connections");
var connectedRef = firebase.database().ref(".info/connected");
var con;


isUserLoggedIn()


function isUserLoggedIn() {
   if (userToken === null) {
      $("#chatBox1").css("display", "none")
      showSignIn()
      hideSignOut()
   }
   else if (userToken) {
      $("#chatBox1").css("display", "")
      pushFBEntireDBValue()
      hideSignIn()
      showSignOut()
      showUserAsLoggedOn()
   }
}

//************************FIREBASE GOOGLE AUTH************************/

function googleSignIn() {
   firebase.auth()
      .signInWithPopup(provider).then(function (result) {
         var token = result.credential.accessToken;
         var user = result.user;

         var userToSave = {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            token: token
         }

         isUserSignedUpAlready(userToSave, token)

      }).catch(function (error) {
         console.log(error.code)
         console.log(error.message)
      });
}

function googleSignOut() {
   firebase.auth().signOut()
      .then(function () {
         clearSessionStorageAndToken()
      }, function (error) {
         console.log('Signout Failed')
      });
}

//*******************CHECKING TO SEE IF USER IS ALREADY SIGNED UP************************/

function isUserSignedUpAlready(userToSave) {
   database.ref("/users").on("value", function (snapshot) {
      if (snapshot.val()) {
         var dbSnapShot = snapshot.val()

         var dbListOfUserEmails = [];
         var entries = Object.entries(dbSnapShot)

         for (var i = 0; i < entries.length; i++) {
            dbListOfUserEmails.push(entries[i][1].email)
            dbListOfUserEmails.push(entries[i][1].name)
         }

         if (dbListOfUserEmails.indexOf(userToSave.email) === -1) {
            console.log("Saving new User");
            saveUser(userToSave)
            saveToken(userToSave)
            isUserLoggedIn()
         }
         else {
            console.log("User already Signed Up");
            saveToken(userToSave)
            isUserLoggedIn()
         }
      }
      else {
         saveUser(userToSave)
         saveToken(userToSave)
         isUserLoggedIn()
      }
   })
}


function saveUser(userToSave) {
   database.ref("/users").push(userToSave)
   isUserSignedUpAlready()
}

function saveToken(userToSave) {
   sessionStorage.setItem("user", userToSave.name);
   sessionStorage.setItem("userToken", userToSave.token);
   sessionStorage.setItem("userPhoto", userToSave.photo);
   sessionStorage.setItem("userEmail", userToSave.email);
   userToken = sessionStorage.getItem("userToken");
}

//************************Hide/Show SignIn and SignOut Buttons************************/
function hideSignIn() {
   $("#signIn").css("display", " none");
}

function hideSignOut() {
   $("#signOut").css("display", "none");
}

function showSignOut() {
   $("#signOut").css("display", "");
}

function showSignIn() {
   $("#signIn").css("display", "");
}

function clearSessionStorageAndToken() {
   showUserAsOffline(sessionStorage.getItem("userEmail"))
   sessionStorage.clear();
   userToken = null
   isUserLoggedIn()

}

//************************************************/





//************************Get and pushing Chats to DOM************************/
$("#submit").click(function (e) {
   e.preventDefault();
   var userChatMessage = $("#userMessage").val().trim()
   var time = moment().format('L, LT');
   if (userChatMessage) {
      saveUserMessageToFirebase(userChatMessage, time)
      $("#userMessage").val(" ")
   }
   else {
      alert("Please enter a chat message")
   }

});

function saveUserMessageToFirebase(message, time) {
   var userName = sessionStorage.getItem("user");
   var userPhotoLink = sessionStorage.getItem("userPhoto");
   var email = sessionStorage.getItem("userEmail");

   database.ref("/messages").push({
      message, userPhotoLink, email, userName,
      time
   })
}



//************************Get and pushing EACH NEW Chat to DOM************************/
function pushFBEntireDBValue() {
   database.ref("/messages").once("value", function (snapShot) {
      if (snapShot.val()) {
         var dbSnapShot = Object.entries(snapShot.val())
         dbSnapShot.forEach((snapShotEntry) => {
            var entry = {
               userMessage: snapShotEntry[1].message,
               userPhotoURL: snapShotEntry[1].userPhotoLink,
               userName: snapShotEntry[1].userName,
               timeCreated: snapShotEntry[1].time,
               email: snapShotEntry[1].email
            }
            dbDataDomFormatting(entry)
         })
      }
   })
}

database.ref("/messages").limitToLast(1).on("child_added", function (snapShot) {
         var entry = {
            userMessage: snapShot.val().message,
            userPhotoURL: snapShot.val().userPhotoLink,
            userName: snapShot.val().userName,
            timeCreated: snapShot.val().time,
            email: snapShot.val().email
         }
      dbDataDomFormatting(entry)
   })

function dbDataDomFormatting({ userMessage, userPhotoURL, userName, timeCreated, email }) {

   var chatDiv = $("<div class='row'>")
   var photoCol = $("<div class='col-sm-2 photoMarginRight'>")
   chatDiv.addClass("divSpace mborder")

   var photoCol = $("<img>")
   photoCol.attr("src", userPhotoURL);
   photoCol.attr("alt", "User Photo");
   photoCol.addClass("userPhotoSize");
   photoCol.append(photoCol)


   var messageCol = $("<div class='col-sm-8'>")
   var userName = $("<p>").text(userName)
   userName.addClass("chatFont")
   var messageText = $("<p>").text(userMessage);
   var timeText = $("<p>").text(timeCreated);
   timeText.addClass("timeFormat")
   messageCol.append(userName, messageText, timeText);

   // var timeCol = $("<div class='col-sm-2'>")
   // timeCol.addClass("timeFormat")
   // timeCol.text(timeCreated)

   chatDiv.append(photoCol, messageCol)
   $("#allChatTexts").prepend(chatDiv)
}


function showUserAsLoggedOn() {
   connectionsRef.once("value", function (snapshot) {
   var fakeUserEmail = "none@gmail.com";
      if (!snapshot.val()) {
         con = connectionsRef.push({ user: "none", email: fakeUserEmail });
         showUserAsLoggedOn()
      }
   var userToAdd = {
      user: sessionStorage.getItem("user"),
      email: sessionStorage.getItem("userEmail"),
      photo: sessionStorage.getItem("userPhoto")
   }

      var userCon = Object.values(snapshot.val())
      var emailsUsersCon = [];
      userCon.forEach(user => {
         emailsUsersCon.push(user.email)
      });

      if (emailsUsersCon.indexOf(userToAdd.email) === -1) {
         con = connectionsRef.push(userToAdd);
      }
      showUserAsOffline(fakeUserEmail)

   })
   }

function showUserAsOffline(email) {
   connectionsRef.orderByChild("email").equalTo(email).once("value", function (snapshot) {
      if (snapshot.val()) {
         var keysToRemove = Object.keys(snapshot.val())
         console.log(keysToRemove);
         connectionsRef.child(keysToRemove[0]).remove();
      }
   });
}



connectionsRef.on("value", function (snapshot) {
   $("#usersOnline").empty()
   $("#usersOnlineSpan").text(snapshot.numChildren());

   var snapShotOnline = Object.entries(snapshot.val())
   var userArrayOnline = []

   snapShotOnline.forEach((user,i) => {
      userArrayOnline.push(user[1])
   })
   console.log(userArrayOnline);

   userArrayOnline.forEach(user => {
      dbUserOnlineDomFormatting(user)
   })

});


function dbUserOnlineDomFormatting({ email, user, photo }) {

   var onlineDiv = $("<div class='row'>")
   onlineDiv.addClass("divSpace mborder")

   var photoDiv = $("<div class='offset-md-2 col-sm-2 photoMarginRight'>")
   var photoCol = $("<img>")
   photoCol.attr("src", photo);
   photoCol.attr("alt", "User Photo");
   photoCol.addClass("userOnlinePhotoSize");
   photoDiv.append(photoCol)

   var nameCol = $("<div class='col-sm-8'>")
   var userName = $("<p>").text(user)
   userName.attr("data-name", email);

   nameCol.append(userName);

   onlineDiv.append(photoCol, nameCol)
   $("#usersOnline").prepend(onlineDiv)
}