const RESET_API_URL = "http://localhost:8080/api/v1/auth/resetPassword";

const message = document.getElementById('resetPassword--message');
console.log(message);

document.getElementById('resetPassword--form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('resetPassword--email').value;
    const password = document.getElementById('resetPassword--password').value;
    const confirmPassword = document.getElementById('resetPassword--confirm').value;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    try {
        if (password !== confirmPassword) {
            throw new Error("Passwords must match");
        }

        const response = await fetch(RESET_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email, password: confirmPassword })
        });

        const text = await response.text();   // get raw text
        let data;
        try {
            data = JSON.parse(text); // try to parse JSON
        } catch {
            data = { message: text }; // fallback if not JSON
        }

        if (!response.ok) {
            throw new Error(data.message || response.statusText || "Failed to reset password");
        }

        // Success
        message.innerHTML = data.message || "Password reset successfully";
        message.style.display = 'flex';
        message.classList.remove('hidden');
        message.classList.add('good--message');

        setTimeout(() => {
            window.location.href = '/login/login.html';
        }, 1000);

    } catch (err) {
        // Error
        message.innerText = err.message;
        message.classList.add('bad--message');
        message.classList.remove('hidden');
        message.style.display = 'flex';

        setTimeout(() => {
            message.classList.add('hidden');
        }, 2000);
    }
});
