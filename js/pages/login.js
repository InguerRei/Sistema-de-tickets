document.getElementById('loginForm')?.addEventListener('submit', async function (e){e.preventDefault();

const username = document.getElementById('username').value.trim();
const password = document.getElementById('password').value.trim();

const response = await fetch('http://localhost:3000/login',{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({username,password})
});

const data = await response.json();

if (!response.ok){
    alert(data.message || 'erro ao fazer login');
        return;
}

alert('login realizado com sucesso!');
window.location.href = 'dashboard.html';

})