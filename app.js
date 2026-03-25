const socket = io("http://localhost:3000");

let currentUser = "";
let currentRoom = "";

// 🔥 화면 전환
function showLogin() {
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("mainPage").style.display = "none";
  document.getElementById("chatPage").style.display = "none";
}

function showMain() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("mainPage").style.display = "block";
  document.getElementById("chatPage").style.display = "none";
}

function showChat() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("mainPage").style.display = "none";
  document.getElementById("chatPage").style.display = "block";
}

// 🔥 로그인
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);

      currentUser = username;
      document.getElementById("userLabel").innerText = username;

      showMain();
    } else {
      alert("로그인 실패");
    }
  });
}

// 🔥 회원가입
function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

// 🔥 로그아웃
function logout() {
  localStorage.clear();
  currentUser = "";
  showLogin();
}

// 🔥 자동 로그인
window.onload = () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (token && username) {
    currentUser = username;
    document.getElementById("userLabel").innerText = username;
    showMain();
  } else {
    showLogin();
  }
};

// 🔥 방 입장
function joinRoom() {
  currentRoom = document.getElementById("room").value;

  socket.emit("joinRoom", currentRoom);
  document.getElementById("roomLabel").innerText = currentRoom;

  document.getElementById("chatBox").innerHTML = "";

  showChat();

  fetch(`http://localhost:3000/messages/${currentRoom}`)
    .then(res => res.json())
    .then(data => {
      data.forEach(msg => renderMessage(msg));
    });
}
function handleKey(event) {
  if (event.key === "Enter") {
    send();
  }
}
// 🔥 메시지 전송
function send() {
  if (!currentUser) {
    alert("로그인 먼저 해라");
    return;
  }

  if (!currentRoom) {
    alert("방 먼저 들어가라");
    return;
  }

  const input = document.getElementById("msg");
  const msg = input.value;
  const token = localStorage.getItem("token");

  socket.emit("sendMessage", {
    text: msg,
    room: currentRoom,
    token: token
  });

  input.value = ""; // 🔥 입력창 비우기
}

// 🔥 메시지 표시
function renderMessage(data) {
  const div = document.createElement("div");

  if (data.user === currentUser) {
    div.className = "myMsg";
  } else {
    div.className = "otherMsg";
  }

  div.innerText = `${data.user}: ${data.text}`;
  document.getElementById("chatBox").appendChild(div);
}

// 🔥 메시지 수신
socket.on("receiveMessage", (data) => {
  if (data.room === currentRoom) {
    renderMessage(data);
  }
});