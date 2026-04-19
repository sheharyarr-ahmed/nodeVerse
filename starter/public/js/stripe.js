import axios from 'axios';
import { showAlert } from './alerts';

const stripePublicKey = document.querySelector(
  'meta[name="stripe-public-key"]',
)?.content;

const stripe =
  window.Stripe && stripePublicKey ? window.Stripe(stripePublicKey) : null;

const bookTour = async (tourId) => {
  try {
    if (!stripe) {
      showAlert('error', 'Payments are not configured yet.');
      return;
    }

    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Could not start checkout. Please try again.';
    showAlert('error', message);
  }
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    bookTour(e.target.dataset.tourId);
  });
}
