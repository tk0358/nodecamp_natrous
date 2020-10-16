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

export const updateReview = async (reviewId, rating, review) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/reviews/${reviewId}`,
      data: {
        rating,
        review,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Thank you for updating a review!');
      location.assign('/my-reviews');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const sortReview = async field => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/reviews?sort=${field}`,
    });
    const reviews = res.data.data.data;
    console.log(reviews);
    let el = '';
    reviews.forEach(review => {
      el += `
        <tr id=${review.id}>
          <td>${review.tour.name}</td>
          <td>${review.user.name}</td>
          <td>${review.rating}</td>
          <td class='review-col'>${review.review}</td>
          <td>${review.createdAt}</td>
          <td>
            <button class='btn btn--yellow btn--small btn--edit-review'>Edit</button>
            <button class='btn btn--red btn--small btn--delete-review'>Delete</button>
          </td>
        </tr>
      `;
    });
    document.querySelector('.reviews-table tbody').innerHTML = el;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const createReviewFromAdmin = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/reviews',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Thank you for writing a review!');
      window.setTimeout(() => {
        location.assign('/manage/reviews');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
