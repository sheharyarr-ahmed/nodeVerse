import axios from 'axios';

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      window.alert('Logged in successfully!');
      window.setTimeout(() => {
        window.location.assign('/');
      }, 1000);
    }
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || 'Login failed. Please try again.';
    window.alert(message);
  }
};

const loginForm = document.querySelector('.form--login');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}
