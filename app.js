// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACLgHwfVw9aZ_IkAkBNGUhACr6L976ovU",
    authDomain: "webrtcandfirebase-0671.firebaseapp.com",
    databaseURL: "https://webrtcandfirebase-0671-default-rtdb.firebaseio.com/",
    projectId: "webrtcandfirebase-0671",
    storageBucket: "webrtcandfirebase-0671.firebasestorage.app",
    messagingSenderId: "424159002904",
    appId: "1:424159002904:web:d808aba82da00b8c965e6d",
    measurementId: "G-VMS1YD4HW8"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let username = '';  // Declare username outside any function
let currentRoom = null; // Current room code

const INACTIVITY_LIMIT = 10 * 60 * 60 * 1000; // 10 hours in milliseconds

// Ensure room '1' exists when the page is loaded
window.onload = function() {
    const room1Ref = firebase.database().ref('rooms/1');
    room1Ref.once('value', snapshot => {
        if (!snapshot.exists()) {
            // Create room '1' with a placeholder message and permanent data
            const roomData = {
                lastActivity: Date.now(),
                messages: {}
            };
            room1Ref.set(roomData);
        }
    });
};

// Set username function
function setUsername() {
    const usernameInput = document.getElementById('usernameInput');
    const name = usernameInput.value.trim();

    if (!name) {
        alert('Please enter a valid username.');
        return;
    }
    username = name;
    alert(`Username set to: ${username}`);
    document.getElementById('usernameSection').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
}

// Go back to home screen from the "join room" section
function backToHome() {
    document.getElementById('joinRoomSection').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
}

// Create a new room
function createRoom() {
    const roomCode = Math.floor(10000 + Math.random() * 90000).toString();
    currentRoom = roomCode;
    const newRoomRef = firebase.database().ref(`rooms/${roomCode}`);
    const newRoomData = {
        lastActivity: Date.now(),
        messages: {}
    };
    newRoomRef.set(newRoomData);
    alert(`Room created! Share this code: ${roomCode}`);
    enterChatRoom();
}

// Open the join room section
function joinRoomSection() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('joinRoomSection').style.display = 'block';
}

// Join an existing room
function joinRoom() {
    const roomCode = document.getElementById('roomCode').value.trim();
    if (!roomCode) {
        alert('Please enter a valid room code.');
        return;
    }

    // Check if the room exists in the database
    const roomRef = firebase.database().ref(`rooms/${roomCode}`);
    roomRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            // Check if it's room '1' (permanent room)
            if (roomCode === '1') {
                currentRoom = '1';
                enterChatRoom();
            } else {
                // Check if the room is inactive for 10 hours
                const roomData = snapshot.val();
                const currentTime = Date.now();
                if (currentTime - roomData.lastActivity > INACTIVITY_LIMIT) {
                    alert('This room has been deleted due to inactivity.');
                } else {
                    currentRoom = roomCode;
                    enterChatRoom();
                }
            }
        } else {
            alert('Room does not exist.');
        }
    });
}

// Enter the chat room
function enterChatRoom() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('joinRoomSection').style.display = 'none';
    document.getElementById('chatRoom').style.display = 'block';
    document.getElementById('currentRoomCode').textContent = currentRoom;

    // Listen for messages in the current room
    const messagesRef = firebase.database().ref(`rooms/${currentRoom}/messages`);
    messagesRef.on('value', (snapshot) => {
        const messages = snapshot.val();
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = ''; // Clear current messages

        if (messages) {
            Object.values(messages).forEach((message) => {
                const messageDiv = document.createElement('div');
                messageDiv.textContent = `${message.sender}: ${message.text}`;
                messagesDiv.appendChild(messageDiv);
            });
        }
    });

    // Update the last activity time in the database to prevent room deletion
    const roomRef = firebase.database().ref(`rooms/${currentRoom}`);
    roomRef.update({
        lastActivity: Date.now()
    });
}

// Send a message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    if (!messageText) {
        alert('Please enter a message.');
        return;
    }

    const messagesRef = firebase.database().ref(`rooms/${currentRoom}/messages`);
    const newMessage = {
        sender: username,
        text: messageText,
        timestamp: Date.now()
    };

    messagesRef.push(newMessage);
    messageInput.value = ''; // Clear input

    // Update last activity for the room
    const roomRef = firebase.database().ref(`rooms/${currentRoom}`);
    roomRef.update({
        lastActivity: Date.now()
    });
}

// Leave the chat room
function leaveRoom() {
    currentRoom = null;
    document.getElementById('chatRoom').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
}
