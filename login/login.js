// const LOGIN_API_URL = "http://localhost:8080/api/v1/auth/login";

// const FORGOT_PASSWORD_API_URL = "http://localhost:8080/api/v1/auth/forgotPasswprd";

// const message = document.getElementById('lgn--message');

// console.log(document.getElementById('login--form'))
// document.getElementById('login--form').addEventListener('submit', async function(e) {
//     e.preventDefault();

//     const username = document.getElementById('user--name').value;
//     const password = document.getElementById('pass--word').value;
//     // console.log(username)
//     // console.log(password)

//     try {
//         const response = await fetch(LOGIN_API_URL, {
//             method: 'POST',
//             headers: {'Content-Type' : 'application/json'},
//             body: JSON.stringify({username, password})
//         });
//         const data = await response.json();
            
//         if(!response.ok) {

//             throw new Error(`Failed to login: ${data.message || response.statusText}`);
//         }
        
//         const authHeader = response.headers.get("Authorization");
//         const token = authHeader?authHeader:null;

//         localStorage.setItem("authToken", token);

//         message.classList.add('hidden');
//         message.classList.remove('bad--message');
        
//         message.innerText = data.message;
        
//         // message.style.display = 'flex';
//         message.classList.remove('hidden');
//         message.classList.add('good--message');
        
//         setTimeout(() => {
//             window.location.href = '/dashboard/dashboard.html';
//         }, 1000);

//     } catch(err) {
//         message.innerText = err.message;
//         message.classList.add('bad--message')
//         message.classList.remove('hidden');
//         message.style.display = 'flex';
//         setTimeout(() => {
//             message.classList.add('hidden');
//         }, 1000);
//     }

// })

const LOGIN_API_URL = "http://localhost:8080/api/v1/auth/login";
const FORGOT_PASSWORD_API_URL = "http://localhost:8080/api/v1/auth/forgotPassword"; 

const message = document.getElementById("lgn--message");
const loginForm = document.getElementById("login--form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("user--name").value.trim();
        const password = document.getElementById("pass--word").value;

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const text = await response.text();
            let data;
            try { 
                data = JSON.parse(text); 

            } catch { 
                data = { message: text }; 
            }

            if (!response.ok) {
                throw new Error(data.message || response.statusText || "Login failed");
            }

            const authHeader = response.headers.get("Authorization");
            const token = authHeader ? authHeader : null;
            localStorage.setItem("authToken", token);

            message.classList.remove("bad--message");
            message.innerText = data.message || "Login successful";
            message.classList.remove("hidden");
            message.classList.add("good--message");

            setTimeout(() => {
                window.location.href = "/dashboard/dashboard.html";
            }, 900);
            
        } catch (err) {
            message.innerText = err.message || "Error during login";
            message.classList.remove("hidden");
            message.classList.remove("good--message");
            message.classList.add("bad--message");
            setTimeout(() => {
                message.classList.add("hidden");
            }, 2000);
        }
    });
}



const forgotPasswordLink = document.getElementById("forgot--password");
const forgotModal = document.getElementById("forgot-modal");
const closeModalBtn = document.getElementById("close-modal");
const forgotForm = document.getElementById("forgot-form");
const forgotMessage = document.getElementById("forgot-message");
const forgotEmailInput = document.getElementById("forgot-email");

function openModal() {
  if (!forgotModal) return;
  forgotMessage && forgotMessage.classList.add("hidden");
  forgotMessage && forgotMessage.classList.remove("bad--message", "good--message");
  forgotModal.classList.remove("hidden");
  setTimeout(() => forgotEmailInput && forgotEmailInput.focus(), 50);
  document.body.classList.add("modal-open");
}

function closeModal() {
  if (!forgotModal) return;
  forgotModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });
}

if (forgotModal) {
  forgotModal.addEventListener("click", (e) => {
    if (e.target === forgotModal) {
      closeModal();
    }
  });
}

function showForgotSuccess(msg) {
  if (!forgotMessage) return;
  forgotMessage.classList.remove("bad--message");
  forgotMessage.classList.add("good--message");
  forgotMessage.innerText = msg;
  forgotMessage.classList.remove("hidden");
}

function showForgotError(msg) {
  if (!forgotMessage) return;
  forgotMessage.classList.remove("good--message");
  forgotMessage.classList.add("bad--message");
  forgotMessage.innerText = msg;
  forgotMessage.classList.remove("hidden");
}

if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (forgotEmailInput && forgotEmailInput.value || "").trim();
    if (!email) {
      showForgotError("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(FORGOT_PASSWORD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!response.ok) {
        throw new Error(data.message || response.statusText || "Failed to send reset link");
      }

      showForgotSuccess(data.message || "Password reset link sent.");
      setTimeout(() => {
        closeModal();
        // forgotModal.classList.add('hidden')
      }, 1400);
    } catch (err) {
      showForgotError(err.message || "Error sending reset link");
    }
  });
}
