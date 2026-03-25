// 🔥 배포 서버 주소
const API = "https://messenger-4zq5.onrender.com";

// 🔥 소켓 연결 (같은 서버면 이게 더 안정적)
const socket = io(API);

// 상태
let currentUser = "";
let currentRoom = "";

// ================= 화면 =================

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

// ================= 로그인 =================

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("아이디랑 비번 입력해라");
    return;
  }

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    })
    .catch(err => {
      console.error(err);
      alert("서버 오류");
    });
}

// ================= 회원가입 =================

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("아이디랑 비번 입력해라");
    return;
  }

  fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "회원가입 완료");
    })
    .catch(err => {
      console.error(err);
      alert("서버 오류");
    });
}

// ================= 로그아웃 =================

function logout() {
  localStorage.clear();
  currentUser = "";
  currentRoom = "";
  showLogin();
}

// ================= 자동 로그인 =================

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

// ================= 채팅 =================

// 방 입장
function joinRoom() {
  const roomInput = document.getElementById("room").value.trim();

  if (!roomInput) {
    alert("방 이름 입력해라");
    return;
  }

  currentRoom = roomInput;

  socket.emit("joinRoom", currentRoom);
  document.getElementById("roomLabel").innerText = currentRoom;

  document.getElementById("chatBox").innerHTML = "";

  showChat();

  // 이전 메시지 불러오기
  fetch(`${API}/messages/${currentRoom}`)
    .then(res => res.json())
    .then(data => {
      data.forEach(msg => renderMessage(msg));
    })
    .catch(err => console.error(err));
}

// 엔터 전송
function handleKey(event) {
  if (event.key === "Enter") {
    send();
  }
}

// 메시지 전송
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
  const msg = input.value.trim();
  const token = localStorage.getItem("token");

  if (!msg) return;

  socket.emit("sendMessage", {
    text: msg,
    room: currentRoom,
    token: token
  });

  input.value = "";
  input.focus();
}

// 메시지 표시
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

// 메시지 수신
socket.on("receiveMessage", (data) => {
  if (data.room === currentRoom) {
    renderMessage(data);
  }
});