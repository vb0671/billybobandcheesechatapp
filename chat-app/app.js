// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyACLgHwfVw9aZ_IkAkBNGUhACr6L976ovU",
  authDomain: "webrtcandfirebase-0671.firebaseapp.com",
  databaseURL: "https://webrtcandfirebase-0671-default-rtdb.firebaseio.com",
  projectId: "webrtcandfirebase-0671",
  storageBucket: "webrtcandfirebase-0671.appspot.com",
  messagingSenderId: "424159002904",
  appId: "1:424159002904:web:d808aba82da00b8c965e6d",
  measurementId: "G-VMS1YD4HW8",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// DOM Elements
const usernameScreen = document.getElementById("usernameScreen");
const mainScreen = document.getElementById("mainScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const messageInput = document.getElementById("messageInput");
const chatWindow = document.getElementById("chatWindow");
const chatHeader = document.getElementById("chatHeader");
const leaveRoomButton = document.getElementById("leaveRoomButton");

let username = null;
let currentRoom = null;

// Set Username
async function setUsername() {
  const input = usernameInput.value.trim();
  if (!input) {
    alert("Please enter a username!");
    return;
  }

  const usernamesRef = db.ref("usernames");
  const snapshot = await usernamesRef.child(input).get();

  if (snapshot.exists()) {
    alert("Username is already taken!");
    return;
  }

  await usernamesRef.child(input).set(true);
  username = input;
  usernameScreen.style.display = "none";
  mainScreen.style.display = "block";
}

// Prompt to Join Room
async function promptJoinRoom() {
  const roomCode = prompt("Enter room code:");
  if (!roomCode) return;
  joinRoom(roomCode);
}

// Create Room
function createRoom() {
  const roomCode = Math.floor(Math.random() * 100000).toString();
  joinRoom(roomCode);
  alert(`Room created! Share this code: ${roomCode}`);
}

// Join Room
function joinRoom(roomCode) {
  currentRoom = roomCode;
  mainScreen.style.display = "none";
  chatScreen.style.display = "block";
  chatWindow.innerHTML = "";
  document.getElementById("roomCode").textContent = currentRoom;  // Dynamically set room code

  const roomRef = db.ref(`rooms/${roomCode}/messages`);
  roomRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    const message = document.createElement("div");
    message.className = "chatMessage";
    const timestamp = new Date(data.timestamp).toLocaleString("en-US", { timeZone: "America/New_York" });

    message.innerHTML = `
      <strong>${data.username}</strong>: ${data.text}
      <br>
      <span class="timestamp">${timestamp}</span>
    `;
    chatWindow.appendChild(message);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
}

// Handle Enter key press
function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Send Message
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  const timestamp = new Date().toISOString();
  db.ref(`rooms/${currentRoom}/messages`).push({ username, text, timestamp });
  messageInput.value = "";
}

// Leave Room
function leaveRoom() {
  if (currentRoom) {
    db.ref(`rooms/${currentRoom}/messages`).off();
    mainScreen.style.display = "block";
    chatScreen.style.display = "none";
    currentRoom = null;
  }
}
