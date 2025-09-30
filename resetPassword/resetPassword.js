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

        if (!response.ok) throw new Error("Failed to reset password");

        const data = await response.json();
        message.innerHTML = "Password reset successfully";
        message.style.display = 'flex';
        message.classList.remove('hidden');
        message.classList.add('good--message');

        setTimeout(() => {
            window.location.href = '/login/login.html';
        }, 1000);

    } catch (err) {
        message.innerText = err.message;
        message.classList.add('bad--message');
        message.classList.remove('hidden');
        message.style.display = 'flex';

        setTimeout(() => {
            message.classList.add('hidden');
        }, 1000);
    }
});
