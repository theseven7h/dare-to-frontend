const LOGIN_API_URL = "http://localhost:8080/api/v1/auth/login";
const message = document.getElementById('lgn--message');

console.log(document.getElementById('login--form'))
document.getElementById('login--form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('user--name').value;
    const password = document.getElementById('pass--word').value;
    // console.log(username)
    // console.log(password)

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await response.json();
            
        if(!response.ok) {

            throw new Error(`Failed to login: ${data.message || response.statusText}`);
        }
        
        const authHeader = response.headers.get("Authorization");
        const token = authHeader?authHeader:null;

        localStorage.setItem("authToken", token);

        message.classList.add('hidden');
        message.classList.remove('bad--message');
        
        message.innerText = data.message;
        
        // message.style.display = 'flex';
        message.classList.remove('hidden');
        message.classList.add('good--message');
        
        setTimeout(() => {
            window.location.href = '/dashboard/dashboard.html';
        }, 1000);

    } catch(err) {
        message.innerText = err.message;
        message.classList.add('bad--message')
        message.classList.remove('hidden');
        message.style.display = 'flex';
    }

})