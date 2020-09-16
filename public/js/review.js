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
  } catch (err) {}
};

// export const showEditForm = e => {
//   const reviewId = e.target.dataset.reviewId;
//   const review =
//     e.target.parentNode.parentNode.parentNode.childNodes[1].lastChild
//       .textContent;
//   e.target.parentNode.parentNode.parentNode.childNodes[1].innerHTML = `<textarea id=review-text name="review-text">${review}</textarea>`;
//   e.target.parentNode.parentNode.firstChild.innerHTML = `
//         <div class="review-form__group rating rating-at-my-reviews">
//           <input id="star5" class="radio-btn hide" name="star" type="radio" value="5">
//           <label for="star5"> ☆</label>
//           <input id="star4" class="radio-btn hide" name="star" type="radio" value="4">
//           <label for="star4"> ☆</label>
//           <input id="star3" class="radio-btn hide" name="star" type="radio" value="3">
//           <label for="star3"> ☆</label>
//           <input id="star2" class="radio-btn hide" name="star" type="radio" value="2">
//           <label for="star2"> ☆</label>
//           <input id="star1" class="radio-btn hide" name="star" type="radio" value="1">
//           <label for="star1"> ☆</label>
//           <div class="clear">
//         </div>
//       `;
//   e.target.parentNode.innerHTML = `
//         <a class="btn btn--green btn--small update-review" data-review-id="${reviewId}"> Update</a>
//       `;
// };
