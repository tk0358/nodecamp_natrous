/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { getTourSelectBox, getUserSelectBox } from './selectBox';

export const createReview = async (rating, review, user, tour) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
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
      url: `/api/v1/reviews/${reviewId}`,
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
    let res;
    if (field) {
      res = await axios({
        method: 'GET',
        url: `/api/v1/reviews?sort=${field}`,
      });
    } else {
      res = await axios({
        method: 'GET',
        url: '/api/v1/reviews',
      });
      // 'http://.../api/v1/reviews'は'http://.../api/vi/reviews?sort=-createdAt'と同じ結果が返ってくる(apiFeaturesのsort()参照)
    }
    const reviews = res.data.data.data;
    let el = '';
    reviews.forEach(review => {
      el += `
        <tr id=${review.id}>
          <td data-tour-id=${review.tour.id}>${review.tour.name}</td>
          <td data-user-id=${review.user._id}>${review.user.name}</td>
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
    document.querySelector('.reviews-table').dataset.sortField = field;
    addEventsToEditReviewBtns(document.querySelectorAll('.btn--edit-review'));
    addEventsToDeleteReviewBtns(
      document.querySelectorAll('.btn--delete-review')
    );
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const createReviewFromAdmin = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Review is successfully created');
      window.setTimeout(() => {
        location.assign('/manage/reviews');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const addEventsToEditReviewBtns = editReviewBtns => {
  editReviewBtns.forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const reviewId = e.target.parentNode.parentNode.id;
      const tourId = e.target.parentNode.parentNode.children[0].dataset.tourId;
      const userId = e.target.parentNode.parentNode.children[1].dataset.userId;
      const rating = e.target.parentNode.parentNode.children[2].textContent;
      const review = e.target.parentNode.parentNode.children[3].textContent;
      const createdAt = e.target.parentNode.parentNode.children[4].textContent;

      let el = '';
      el += await getTourSelectBox(tourId);
      el += await getUserSelectBox(userId);
      // rating
      el += `
          <td>
            <select id='rating'>
              <option value='1'>1</option>
              <option value='2'>2</option>
              <option value='3'>3</option>
              <option value='4'>4</option>
              <option value='5'>5</option>
            </select>
          </td>
        `;
      // review
      el += `
          <td>
            <textarea id='review'>${review}</textarea>
          </td>
        `;
      // ceratedAt
      el += `<td>${createdAt}</td>`;
      // actions
      el += `
          <td>
            <button class='btn btn--blue btn--small btn--update-review'>Update</button>
            <button class='btn btn--green btn--small btn--cancel'>Cancel</button>
          </td>
        `;
      const updateReviewBtn = document.querySelector('.btn--update-review');
      // edit => update ボタンへの変更は１か所のみ
      if (!updateReviewBtn) {
        e.target.parentNode.parentNode.innerHTML = el;

        document.getElementById('rating').options[
          `${rating - 1}`
        ].selected = true;

        document
          .querySelector('.btn--update-review')
          .addEventListener('click', updateReviewFunc);
        document.querySelector('.btn--cancel').addEventListener('click', e => {
          e.preventDefault();
          sortReview(
            document.querySelector('.reviews-table').dataset.sortField
          );
        });
      }
    });
  });
};

const updateReviewFunc = e => {
  e.preventDefault();
  const reviewId = e.target.parentNode.parentNode.id;
  const form = new URLSearchParams();
  form.append('tour', document.getElementById('tour').value);
  form.append('user', document.getElementById('user').value);
  form.append('rating', document.getElementById('rating').value);
  form.append('review', document.getElementById('review').value);
  updateReviewFromAdmin(reviewId, form);
};

const updateReviewFromAdmin = async (reviewId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${reviewId}`,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'This review is updated successfully');
      window.setTimeout(() => {
        sortReview(document.querySelector('.reviews-table').dataset.sortField);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const deleteReviewFromAdmin = async reviewId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
    });
    if (res.status === 204) {
      showAlert('success', 'This review is deleted successfully!');
      window.setTimeout(() => {
        sortReview(document.querySelector('.reviews-table').dataset.sortField);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const addEventsToDeleteReviewBtns = deleteReviewBtns => {
  deleteReviewBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const dialog = window.confirm('本当にこのレビューを削除しますか？');
      if (dialog) {
        const reviewId = e.target.parentNode.parentNode.id;
        deleteReviewFromAdmin(reviewId);
      } else {
        sortReview(document.querySelector('.reviews-table').dataset.sortField);
      }
    });
  });
};

export const deleteReviewAtMyReviews = async reviewId => {
  try {
    const result = window.confirm('CONFIRM: Do you delete this review?')
    if (result) {
      const res = await axios({
        method: 'DELETE',
        url: `/api/v1/reviews/${reviewId}`
      })
      if (res.status === 204) {
        showAlert('success', 'This review is deleted successfully!');
        location.reload(true);
      }
    } else {
      location.reload(false);
    }
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
}