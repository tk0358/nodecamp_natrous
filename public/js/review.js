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
    console.log(field);
    let res;
    if (field) {
      // console.log('field is not undefined');
      res = await axios({
        method: 'GET',
        url: `http://127.0.0.1:3000/api/v1/reviews?sort=${field}`,
      });
    } else {
      // console.log('field is undefined');
      res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:3000/api/v1/reviews',
      });
      // 'http://.../api/v1/reviews'は'http://.../api/vi/reviews?sort=-createdAt'と同じ結果が返ってくる(apiFeaturesのsort()参照)
    }
    const reviews = res.data.data.data;
    // console.log(reviews);
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

      // console.log(reviewId, tourId, userId, rating, review);

      let el = '';
      el += await getTourSelectBoxAtEditReview(tourId);
      el += await getUserSelectBoxAtEditReview(userId);
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
          location.reload(false);
        });
      }
    });
  });
};

const updateReviewFunc = e => {
  e.preventDefault();
  const reviewId = e.target.parentNode.parentNode.id;
  // console.log(reviewId);
  const form = new URLSearchParams();
  form.append('tour', document.getElementById('tour').value);
  form.append('user', document.getElementById('user').value);
  form.append('rating', document.getElementById('rating').value);
  form.append('review', document.getElementById('review').value);
  console.log(...form.entries());
  updateReviewFromAdmin(reviewId, form);
};

const getTourSelectBoxAtEditReview = async tourId => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/tours',
    });
    const tours = res.data.data.data;
    let el = '';
    el += `<td><select id='tour'>`;
    // console.log(tourId);
    // console.log(tours);
    tours.forEach(tour => {
      // console.log(tour.id);
      if (tourId === tour.id) {
        el += `<option value='${tour.id}' selected>${tour.name}</option>`;
      } else {
        el += `<option value='${tour.id}'>${tour.name}</option>`;
      }
    });
    el += `</select></td>`;
    // console.log(el);
    return el;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const getUserSelectBoxAtEditReview = async userId => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users',
    });
    const users = res.data.data.data;
    // console.log(users);
    let el = '';
    el += `<td><select id='user'>`;
    users.forEach(user => {
      if (userId === user._id) {
        el += `<option value='${user._id}' selected>${user.name}</option>`;
      } else {
        el += `<option value='${user._id}'>${user.name}</option>`;
      }
    });
    el += `</select></td>`;
    // console.log(el);
    return el;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const updateReviewFromAdmin = async (reviewId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/reviews/${reviewId}`,
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
      url: `http://127.0.0.1:3000/api/v1/reviews/${reviewId}`,
    });
    console.log(res);
    if (res.status === 204) {
      showAlert('success', 'This review is deleted successfully!');
      window.setTimeout(() => {
        location.reload(true);
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
        location.reload(false);
      }
    });
  });
};
