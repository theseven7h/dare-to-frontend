const RESET_API_URL = "http://localhost:8080/api/v1/auth/resetPassword"

const resetButton = document.querySelector('reset__btn')

document.getElementById('reset--form').addEventListener('submit', async function(e) {
    const email = document.getElementById('form--email').value
    const password = document.getElementById('form--password').value
    const confirmPassword = document.getElementById('confirm--password').value
    try {
        if(password !== confirmPassword) {
            throw new err("Password must match")
        }

        const response = await fetch(RESET_API_URL, {
            method: 'POST',
            headers: {'content-Type' : 'application/json'},
            body: {token, email, confirmPassword}
        })

    } catch(err) {

    }
})