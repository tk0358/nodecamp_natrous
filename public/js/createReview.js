/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createReview = async (rating, review, user, tour) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/reviews',
      data: {
        rating,
        review,
        user,
        tour,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Thank you for writing a review!');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
