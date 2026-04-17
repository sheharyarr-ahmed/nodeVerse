import axios from 'axios';
import { showAlert } from './alerts';

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (err) {
    showAlert('error', 'Error logging out. Try again.');
  }
};

document.addEventListener('click', (e) => {
  const logoutBtn = e.target.closest('.nav__el--logout');
  if (!logoutBtn) return;

  e.preventDefault();
  logout();
});
