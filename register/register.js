const REGISTER_API_URL = "http://localhost:8080/api/v1/auth/register";
const message = document.getElementById('reg--message');

// console.log(document.getElementById('register--form'));

document.getElementById('register--form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('form--username').value
    const email = document.getElementById('form--email').value
    const password = document.getElementById('form--password').value
    
    // console.log(document.getElementById('username'));
    try {
        const response = await fetch(REGISTER_API_URL, {
            method: 'POST',
            headers: {'content-Type' : 'application/json'},
            body: JSON.stringify({username, password, email})
        });

        if(!response.ok) throw new Error("Failed to register");
        
        const data = await response.json();

        
        message.innerText = data.message;
        message.style.display = 'flex';
        message.classList.remove('hidden');
        
        setTimeout(() => {
            window.location.href = '/login/login.html';
        }, 1000);

    } catch(err) {
        message.innerText = err.message;
        message.classList.add('bad--message')
        message.classList.remove('hidden');
        message.style.display = 'flex';
        setTimeout(() => {
            message.classList.add('hidden');
        }, 1000);
    }
});

