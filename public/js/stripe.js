/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51HNPEDAWRC6UJfx6eNQZmdMdPsjp76D3nCgmwXu155cC6lvNW9syWdN3trGoP2PosYlyTz8ytJlsh6FKDGsWEK4500ApHAu67P'
);

export const bookTour = async (tourId, startDate) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}/${startDate}`
    );
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

// // Create an instance of the Stripe object with your publishable API key
// var stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
// var checkoutButton = document.getElementById('checkout-button');

// checkoutButton.addEventListener('click', function () {
//   // Create a new Checkout Session using the server-side endpoint you
//   // created in step 3.
//   fetch('/create-checkout-session', {
//     method: 'POST',
//   })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (session) {
//       return stripe.redirectToCheckout({ sessionId: session.id });
//     })
//     .then(function (result) {
//       // If `redirectToCheckout` fails due to a browser or network
//       // error, you should display the localized error message to your
//       // customer using `error.message`.
//       if (result.error) {
//         alert(result.error.message);
//       }
//     })
//     .catch(function (error) {
//       console.error('Error:', error);
//     });
// });
