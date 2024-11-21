// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyACLgHwfVw9aZ_IkAkBNGUhACr6L976ovU",
  authDomain: "webrtcandfirebase-0671.firebaseapp.com",
  projectId: "webrtcandfirebase-0671",
  storageBucket: "webrtcandfirebase-0671.appspot.com",
  messagingSenderId: "424159002904",
  appId: "1:424159002904:web:d808aba82da00b8c965e6d",
  measurementId: "G-VMS1YD4HW8"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// UI elements
const roomCodeInput = document.getElementById("roomCode");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const joinButton = document.getElementById("joinButton");
const createButton = document.getElementById("createButton");
const usernameInput = document.getElementById("usernameInput");
const setUsernameButton = document.getElementById("setUsernameButton");
const chatWindow = document.getElementById("chatWindow");
const backButton = document.getElementById("backButton");

// Event Listeners
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
setUsernameButton.addEventListener("click", setUsername);
createButton.addEventListener("click", createRoom);
joinButton.addEventListener("click", joinRoom);
backButton.addEventListener("click", goBack);

let currentUsername = "";

// Set username function
function setUsername() {
  const username = usernameInput.value.trim();
  if (username) {
    const usernameRef = database.ref("usernames");
    usernameRef.once("value", (snapshot) => {
      let usernameTaken = false;
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val() === username) {
          usernameTaken = true;
        }
      });

      if (usernameTaken) {
        alert("This username is already taken. Please choose another one.");
      } else {
        currentUsername = username;
        usernameRef.push(username);
        alert("Username set successfully!");
        showMainScreen();
      }
    });
  }
}

// Create room function
function createRoom() {
  const roomCode = generateRoomCode();
  const roomRef = database.ref("rooms/" + roomCode);
  
  roomRef.set({
    createdAt: Date.now(),
    messages: []
  });

  alert("Room created with code: " + roomCode);
  joinRoom(roomCode); // Automatically join the room after creating it
}

// Join room function
function joinRoom() {
  const roomCode = roomCodeInput.value.trim();
  if (roomCode === "") {
    alert("Please enter a valid room code.");
    return;
  }

  const roomRef = database.ref("rooms/" + roomCode);
  roomRef.once("value", function(snapshot) {
    if (snapshot.exists()) {
      displayMessages(roomCode);
      showChatScreen();
    } else {
      alert("Room does not exist.");
    }
  });
}

// Show the main screen
function showMainScreen() {
  document.getElementById("mainScreen").style.display = "block";
  document.getElementById("setUsernameScreen").style.display = "none";
  document.getElementById("chatScreen").style.display = "none";
}

// Show the chat screen
function showChatScreen() {
  document.getElementById("mainScreen").style.display = "none";
  document.getElementById("setUsernameScreen").style.display = "none";
  document.getElementById("chatScreen").style.display = "block";
}

// Go back to the main screen
function goBack() {
  showMainScreen();
}

// Generate a random room code
function generateRoomCode() {
  return Math.floor(10000 + Math.random() * 90000); // Generate a 5-digit room code
}

// Display messages in the chat window
function displayMessages(roomCode) {
  chatWindow.innerHTML = ''; // Clear the previous messages

  const roomMessagesRef = database.ref("rooms/" + roomCode + "/messages");
  roomMessagesRef.on("child_added", (data) => {
    const messageData = data.val();
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Username element with bold text
    const usernameElement = document.createElement("strong");
    usernameElement.textContent = messageData.username;

    // Timestamp element (EST time zone)
    const timestampElement = document.createElement("small");
    timestampElement.textContent = new Date(messageData.timestamp).toLocaleString("en-US", { timeZone: "America/New_York" });

    // Message content
    const messageContent = document.createElement("p");
    messageContent.textContent = messageData.message;

    // Add username, timestamp, and message content to the message element
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(timestampElement);
    messageElement.appendChild(messageContent);

    // Add a tiny space between messages
    const spaceElement = document.createElement("div");
    spaceElement.classList.add("message-space");

    // Append the message and space to the chat window
    chatWindow.appendChild(messageElement);
    chatWindow.appendChild(spaceElement);

    // Scroll to the latest message
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
}

// Send a message function
function sendMessage() {
  const roomCode = roomCodeInput.value.trim();
  const message = messageInput.value.trim();
  
  if (message && roomCode && currentUsername) {
    const messageRef = database.ref("rooms/" + roomCode + "/messages");
    const newMessageRef = messageRef.push();

    newMessageRef.set({
      username: currentUsername,
      message: message,
      timestamp: Date.now()
    });

    messageInput.value = ''; // Clear the message input field
  }
}

// Remove username from Firebase when the tab is closed
window.onbeforeunload = function() {
  if (currentUsername) {
    const usernameRef = database.ref("usernames");
    usernameRef.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val() === currentUsername) {
          childSnapshot.ref.remove();
        }
      });
    });
  }
};
