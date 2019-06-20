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
var userToken = notLoggedInMessage()
var dbListOfUserNames = [];


isUserLoggedIn()


function isUserLoggedIn() {
   var userNotLoggedIn = notLoggedInMessage()
   if (userToken === userNotLoggedIn) {
      $("#chatBox1").css("display", "none")
      console.log(userToken);
      showSignIn()
      hideSignOut()
   }
   else if (userToken) {
      $("#chatBox1").css("display", "")
      console.log(userToken);
      hideSignIn()
      showSignOut()
   }
}

//************************FIREBASE GOOGLE AUTH************************/

function googleSignIn() {
   firebase.auth()
      .signInWithPopup(provider).then(function (result) {
         var token = result.credential.accessToken;
         console.log(token)

         var user = result.user;
         console.log(user)

         var userToSave = {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            token: token
         }
         console.log(userToSave);

         isUserSignedUpAlready(userToSave, token)

      }).catch(function (error) {
         var errorCode = error.code;
         var errorMessage = error.message;
         console.log(error.code)
         console.log(error.message)
      });
}

function googleSignOut() {
   firebase.auth().signOut()
      .then(function () {
         console.log('Signout Successful')
         clearSessionStorageAndToken()
      }, function (error) {
         console.log('Signout Failed')
      });
}

//*******************CHECKING TO SEE IF USER IS ALREADY SIGNED UP************************/

function isUserSignedUpAlready(userToSave, token) {
   database.ref("/users").on("value", function (snapshot) {
      console.log(snapshot.val());
      if (snapshot.val()) {
         var dbSnapShot = snapshot.val()

         var dbListOfUserEmails = [];
         var entries = Object.entries(dbSnapShot)
         console.log(entries);

         for (var i = 0; i < entries.length; i++) {
            dbListOfUserEmails.push(entries[i][1].email)
            dbListOfUserEmails.push(entries[i][1].name)
         }
         console.log(dbListOfUserEmails);


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
   sessionStorage.setItem("user", userToSave.name)
   sessionStorage.setItem("userToken", userToSave.token)
   sessionStorage.setItem("userPhoto", userToSave.photo)
   userToken = sessionStorage.getItem("userToken")
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
   sessionStorage.clear();
   userToken = notLoggedInMessage()
   isUserLoggedIn()
}

function notLoggedInMessage() {
   return "Not Logged In"
}
//************************************************/





//************************Get and pushing Chats to DOM************************/
$("#submit").click(function (e) {
   e.preventDefault();
   var userChatMessage = $("#userMessage").val().trim()
   console.log(userChatMessage);
   if (userChatMessage) {
      saveUserMessageToFirebase(userChatMessage)
      $("#userMessage").val(" ")

   }
   else {
      alert("Please enter a chat message")
   }

});

function saveUserMessageToFirebase(message) {
   var userName = sessionStorage.getItem("user")
   var photoLink = sessionStorage.getItem("userPhoto")

   database.ref("/messages").push({
      chat: message,
      photo: photoLink,
      userWhoPostedThis: userName
   })
}


//************************Get and pushing EACH NEW Chat to DOM************************/

database.ref("/messages").on("child_added", function (childSnapShot, prevChildKey) {
   console.log(prevChildKey);
   console.log(childSnapShot.val());
   var message = childSnapShot.val().chat
   console.log(message);
   var photoURL = childSnapShot.val().photo
   console.log(photoURL);

   var chatOwnersName = ""
   if (!childSnapShot.val().userWhoPostedThis) {
      chatOwnersName = "Anonymous wrote:"
   } else {
      chatOwnersName = childSnapShot.val().userWhoPostedThis += " wrote:"
   }

   var chatDiv = $("<div class='row'>")
   var photoCol = $("<div class='col-sm-2 photoMarginRight'>")


   chatDiv.addClass("divSpace mborder")

   var messageCol = $("<div class='col-sm-9'>")
   var messageName = $("<p>").text(chatOwnersName)
   messageName.addClass("chatFont")
   console.log(messageName);
   var messageText = $("<p>").text(message)
   messageCol.append(messageName, messageText)
   // messageCol.addClass("messBorder")


   var userPhoto = $("<img>")
   userPhoto.attr("src", photoURL);
   userPhoto.attr("alt", "User Photo");
   userPhoto.addClass("userPhotoSize");
   photoCol.append(userPhoto)

   chatDiv.append(photoCol, messageCol)

   $("#allChatTexts").prepend(chatDiv)


})

