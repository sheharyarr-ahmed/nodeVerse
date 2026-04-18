import axios from 'axios';
import { showAlert } from './alerts';

const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'password'
          ? '/api/v1/users/updateMyPassword'
          : '/api/v1/users/updateMe',
      data,
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        type === 'password'
          ? 'Password updated successfully!'
          : 'Settings updated successfully!',
      );
      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Could not update settings. Please try again.';
    showAlert('error', message);
  }
};

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    const photo = document.getElementById('photo').files[0];
    if (photo) form.append('photo', photo);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    await updateSettings(
      {
        passwordCurrent: document.getElementById('password-current').value,
        password: document.getElementById('password').value,
        passwordConfirm: document.getElementById('password-confirm').value,
      },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
