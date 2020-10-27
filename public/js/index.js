/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, smsAuth, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import {
  createReview,
  updateReview,
  sortReview,
  createReviewFromAdmin,
  addEventsToEditReviewBtns,
  addEventsToDeleteReviewBtns,
  deleteReviewAtMyReviews
} from './review';
import { createLike, deleteLike } from './like';
import { updateTour, createTour, deleteTour, getTourInfo } from './tour';
import { updateUser, deleteUser, createUser } from './user';
import {
  sortBooking,
  addEventsToEditBookingBtns,
  addEventsToDeleteBookingBtns,
  createBooking,
} from './booking';
import { getStartDateSelectBoxAtBookingForm } from './selectBox';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const smsForm = document.querySelector('.form--sms');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtns = document.querySelectorAll('.book-tour');
const reviewForm = document.querySelector('.review-form');
const heartBtn = document.getElementById('heart');
const reviewEditForm = document.getElementById('review-edit-form');
const addDateBtn = document.getElementById('add-date-button');
const deleteDateBtn = document.getElementById('delete-date-button');
const addLocBtn = document.getElementById('add-loc-button');
const deleteLocBtn = document.getElementById('delete-loc-button');
const updateTourForm = document.getElementById('form--edit-tour');
const createTourForm = document.getElementById('form--create-tour');
const deleteTourBtns = document.querySelectorAll('.btn--delete-tour');
const selectBoxDifficultyEdit = document.querySelector(
  '.selectbox--difficulty-edit'
);
const editUserBtns = document.querySelectorAll('.btn--edit-user');
const deleteUserBtns = document.querySelectorAll('.btn--delete-user');
const createUserForm = document.getElementById('form--create-user');

// Review Manageページのsortボタン
const reviewTourSortBtn = document.getElementById('review-tour-sort');
const reviewUserSortBtn = document.getElementById('review-user-sort');
const reviewCreatedSortBtn = document.getElementById('review-created-sort');

const createReviewForm = document.getElementById('form--create-review');
const editReviewBtns = document.querySelectorAll('.btn--edit-review');
const deleteReviewBtns = document.querySelectorAll('.btn--delete-review');

// Booking Manageページのsortボタン
const bookingTourSortBtn = document.getElementById('booking-tour-sort');
const bookingUserSortBtn = document.getElementById('booking-user-sort');
const bookingDateSortBtn = document.getElementById('booking-date-sort');
const bookingCreatedSortBtn = document.getElementById('booking-created-sort');

const editBookingBtns = document.querySelectorAll('.btn--edit-booking');
const deleteBookingBtns = document.querySelectorAll('.btn--delete-booking');

const createBookingForm = document.getElementById('form--create-booking');

// delete buttons at my reviews page
const deleteReviewBtnsAtMyReviews = document.querySelectorAll('.delete-review');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (smsForm)
  smsForm.addEventListener('submit', e => {
    e.preventDefault();

    const serviceId = smsForm.dataset.serviceId
    const code = document.getElementById('sms').value;
    smsAuth(serviceId, code);
  })

if (signupForm)
  signupForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtns)
  [...bookBtns].forEach(el =>
    el.addEventListener('click', async e => {
      e.target.textContent = 'Processing...';
      const { tourId, startDate } = e.target.dataset;
      await bookTour(tourId, startDate);
    })
  );

if (reviewForm)
  reviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const rating = reviewForm.star.value;
    const review = document.getElementById('review-text').value;
    const user = document.getElementById('review-user').dataset.userId;
    const tour = document.getElementById('review-user').dataset.tourId;
    console.log(rating, review, user, tour);
    createReview(rating, review, user, tour);
  });

if (heartBtn)
  heartBtn.addEventListener('click', e => {
    // e.preventDefault();
    const user = heartBtn.dataset.userId;
    const tour = heartBtn.dataset.tourId;
    const like = heartBtn.dataset.likeId;
    if (heartBtn.classList.contains('active')) {
      heartBtn.classList.remove('active');
      deleteLike(like);
    } else {
      heartBtn.classList.add('active');
      createLike(user, tour);
    }
  });

if (reviewEditForm)
  reviewEditForm.addEventListener('submit', e => {
    e.preventDefault();
    const reviewId = reviewEditForm.dataset.reviewId;
    const rating = reviewEditForm.star.value;
    const review = document.getElementById('reviwe-edit').value;
    updateReview(reviewId, rating, review);
  });

// button to add input fields for startDate
if (addDateBtn)
  addDateBtn.addEventListener('click', e => {
    e.preventDefault();
    const formStartDates = document.getElementById('form__startDates');
    let count = formStartDates.childElementCount;
    // console.log(count);
    const el = `
      <div class="form__group form__group-startDate">
        <label class="form__label" for="startDate${count}">startDate${
      count + 1
    }</label>
        <label class="form__label-small" for="startDate${count}">startDate</label>
        <input class="form__input" id="startDate${count}" type="text">
        <label class="form__label-small" for="participant${count}">participant</label>
        <input class="form__input" id="participant${count}" type="text">
        <label class="form__label-small" for="soldOut${count}">soldOut</label>
        <select class="form__input" id="soldOut${count}">
          <option value="true">true</option>
          <option value="false" selected>false</option>
        </select>
      </div>
    `;
    formStartDates.insertAdjacentHTML('beforeend', el);
    count = formStartDates.childElementCount;
    if (count === 10) {
      addDateBtn.disabled = true;
    } else if (count === 2) {
      deleteDateBtn.disabled = false;
    }
  });

if (deleteDateBtn)
  deleteDateBtn.addEventListener('click', e => {
    e.preventDefault();
    const startDateGroups = document.getElementsByClassName(
      'form__group-startDate'
    );
    // console.log(startDateGroups);
    const formStartDates = document.getElementById('form__startDates');
    formStartDates.removeChild(startDateGroups[startDateGroups.length - 1]);
    const count = formStartDates.childElementCount;
    if (count === 9) {
      addDateBtn.disabled = false;
    } else if (count === 1) {
      deleteDateBtn.disabled = true;
    }
  });

if (addLocBtn)
  addLocBtn.addEventListener('click', e => {
    e.preventDefault();
    const formlocations = document.getElementById('form__locations');
    let count = formlocations.childElementCount;
    // console.log(count);
    const el = `
      <div class="form__group form__group-location">
        <label class="form__label" for="coordinates-ew-${count}">locations${
      count + 1
    }</label>
        <label class="form__label-small" for="coordinates-ew-${count}">coordinates(east+/west-)</label>
        <input class="form__input" id="coordinates-ew-${count}" type="text">
        <label class="form__label-small" for="coordinates-ns-${count}">coordinates(north+/south-)</label>
        <input class="form__input" id="coordinates-ns-${count}" type="text">
        <label class="form__label-small" for="description${count}">description</label>
        <input class="form__input" id="description${count}" type="text">
        <label class="form__label-small" for="day${count}">day</label>
        <input class="form__input" id="day${count}" type="text">
      </div>
    `;
    formlocations.insertAdjacentHTML('beforeend', el);
    count = formlocations.childElementCount;
    if (count === 10) {
      addLocBtn.disabled = true;
    } else if (count === 2) {
      deleteLocBtn.disabled = false;
    }
  });

if (deleteLocBtn)
  deleteLocBtn.addEventListener('click', e => {
    e.preventDefault();
    const formlocations = document.getElementById('form__locations');
    const locationGroups = document.getElementsByClassName(
      'form__group-location'
    );
    formlocations.removeChild(locationGroups[locationGroups.length - 1]);
    const count = formlocations.childElementCount;
    if (count === 9) {
      addLocBtn.disabled = false;
    } else if (count === 1) {
      deleteLocBtn.disabled = true;
    }
  });

const appendFormInfo = (form, type) => {
  form.append('name', document.getElementById('name').value);
  form.append('summary', document.getElementById('summary').value);
  form.append('description', document.getElementById('description').value);
  form.append('price', document.getElementById('price').value);
  form.append('difficulty', document.getElementById('difficulty').value);
  form.append('duration', document.getElementById('duration').value);
  form.append('maxGroupSize', document.getElementById('maxGroupSize').value);

  document.querySelectorAll('.form__group-startDate').forEach((el, i) => {
    form.append(`startDates[${i}][startDate]`, el.children[2].value);
    form.append(`startDates[${i}][participant]`, el.children[4].value);
    form.append(`startDates[${i}][soldOut]`, el.children[6].value);
  });
  form.append(
    'startLocation[coordinates][0]',
    document.getElementById('startloc-ew').value
  );
  form.append(
    'startLocation[coordinates][1]',
    document.getElementById('startloc-ns').value
  );
  form.append(
    'startLocation[address]',
    document.getElementById('address').value
  );
  form.append(
    'startLocation[description]',
    document.getElementById('startloc-description').value
  );
  form.append('startLocation[type]', 'Point');

  document.querySelectorAll('.form__group-location').forEach((el, i) => {
    form.append(`locations[${i}][type]`, 'Point');
    form.append(`locations[${i}][coordinates][0]`, el.children[2].value);
    form.append(`locations[${i}][coordinates][1]`, el.children[4].value);
    form.append(`locations[${i}][description]`, el.children[6].value);
    form.append(`locations[${i}][day]`, el.children[8].value);
  });
  // updateでは, ratingsAverage, ratingsQuantityの欄があり、画像をアップロードすることも可能
  if (type === 'update') {
    form.append(
      'ratingsAverage',
      document.getElementById('ratingsAverage').value
    );
    form.append(
      'ratingsQuantity',
      document.getElementById('ratingsQuantity').value
    );
    const imageCover = document.getElementById('imageCover').files[0];
    const images = document.getElementById('images').files;
    console.log(images);
    if (imageCover) form.append('imageCover', imageCover);
    if (images) {
      Array.from(images).forEach(image => {
        form.append('images', image);
      });
    }
  }
  return form;
};

if (updateTourForm)
  updateTourForm.addEventListener('submit', e => {
    e.preventDefault();
    const tourId = updateTourForm.dataset.id;

    let form = new FormData();
    form = appendFormInfo(form, 'update');

    // console.log(...form.entries());

    updateTour(form, tourId);
  });

if (createTourForm)
  createTourForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new URLSearchParams();
    createTour(appendFormInfo(form, 'create'));
  });

if (deleteTourBtns)
  deleteTourBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const dialog = window.confirm('本当にこのツアーを削除しますか？');
      if (dialog) {
        const tourId = e.target.parentNode.parentNode.id;
        deleteTour(tourId);
      } else {
        location.reload(false);
      }
    });
  });

// EditTourにおいて、difficultyのselectBoxに初期値を設定する
if (selectBoxDifficultyEdit) {
  // console.log(selectBoxDifficultyEdit.options);
  const val = selectBoxDifficultyEdit.dataset.difficulty;
  console.log(val);
  if (val === 'easy') {
    selectBoxDifficultyEdit.options[1].selected = true;
  } else if (val === 'medium') {
    selectBoxDifficultyEdit.options[2].selected = true;
  } else {
    selectBoxDifficultyEdit.options[3].selected = true;
  }
}

if (editUserBtns)
  editUserBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const userId = e.target.parentNode.parentNode.id;
      const name = e.target.parentNode.parentNode.children[0].textContent;
      const email = e.target.parentNode.parentNode.children[1].textContent;
      const role = e.target.parentNode.parentNode.children[2].textContent;
      // query middlewareでactiveがfalseなdocumentは返ってこないので、すべてのdocumentのactiveはtrue
      // const active = e.target.parentNode.parentNode.children[3].textContent;
      const mailConfirm =
        e.target.parentNode.parentNode.children[4].textContent;
      const updateBtn = document.querySelector('.btn--update-user');
      // edit => update ボタンへの変更は１か所のみ
      if (!updateBtn) {
        e.target.parentNode.parentNode.innerHTML = `
          <tr id='${userId}'>
            <td><input type='text' value='${name}'></td>
            <td><input type='text' value='${email}'></td>
            <td><select id='role'><option value='user'>user</option><option value='guide'>guide</option><option value='lead-guide'>lead-guide</option><option value='admin'>admin</option></select></td>
            <td><select><option value='true' selected>true</option><option value='false'>false</option></select></td>
            <td><select id='mailConfirm'><option value='true'>true</option><option value='false'>false</option></select></td>
            <td><input class='form__upload' type='file' accept='image/*' id='photo' name='photo'><label for='photo'>Change Photo</label></td>
            <td>
              <button class='btn btn--blue btn--small btn--update-user'>Update</button>
              <button class='btn btn--green btn--small btn--cancel'>Cancel</button>
            </td>
          </tr>
          `;
        const roleOptions = { user: 0, guide: 1, 'lead-guide': 2, admin: 3 };
        const roleNum = roleOptions[`${role}`];
        document.getElementById('role').options[`${roleNum}`].selected = true;

        const mailConfirmOptions = { true: 0, false: 1 };
        const mailConfirmNum = mailConfirmOptions[`${mailConfirm}`];
        document.getElementById('mailConfirm').options[
          `${mailConfirmNum}`
        ].selected = true;

        document
          .querySelector('.btn--update-user')
          .addEventListener('click', updateUserFunc);
        document
          .querySelector('.btn--cancel')
          .addEventListener('click', e => {
            e.preventDefault();
            location.reload(true);
          });
      }
    });
  });

// Updateボタンの機能
const updateUserFunc = e => {
  e.preventDefault();
  const userId = e.target.parentNode.parentNode.id;
  const form = new FormData();
  const elements = e.target.parentNode.parentNode.children;
  form.append('name', elements[0].firstChild.value);
  form.append('email', elements[1].firstChild.value);
  form.append('role', elements[2].firstChild.value);
  form.append('active', elements[3].firstChild.value);
  form.append('mailConfirm', elements[4].firstChild.value);
  form.append('photo', elements[5].firstChild.files[0]);
  // console.log(...form.entries());
  updateUser(form, userId);
};

// Deleteボタン
if (deleteUserBtns)
  deleteUserBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const dialog = window.confirm('本当にこのユーザを削除しますか？');
      if (dialog) {
        const userId = e.target.parentNode.parentNode.id;
        console.log(userId);
        deleteUser(userId);
      } else {
        location.reload(false);
      }
    });
  });

if (createUserForm)
  createUserForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('password', document.getElementById('password').value);
    form.append(
      'passwordConfirm',
      document.getElementById('passwordConfirm').value
    );
    form.append('role', document.getElementById('role').value);
    form.append('mailConfirm', document.getElementById('mailConfirm').value);
    form.append('photo', document.getElementById('photo').files[0]);
    createUser(form);
  });

// sortボタンの機能
const sortBtnFunc = (btn, field, sortFunc) => {
  let count = 0;
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (count % 2 === 0) {
      sortFunc(field);
    } else {
      sortFunc(`-${field}`);
    }
    count++;
  });
};

// Review Manage Pageのソート機能
if (reviewTourSortBtn) sortBtnFunc(reviewTourSortBtn, 'tour', sortReview);
if (reviewUserSortBtn) sortBtnFunc(reviewUserSortBtn, 'user', sortReview);
if (reviewCreatedSortBtn)
  sortBtnFunc(reviewCreatedSortBtn, 'createdAt', sortReview);

if (createReviewForm)
  createReviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new URLSearchParams();
    form.append('tour', document.getElementById('tour').value);
    form.append('user', document.getElementById('user').value);
    form.append('rating', document.getElementById('rating').value);
    form.append('review', document.getElementById('review').value);

    // console.log(...form.entries());
    createReviewFromAdmin(form);
  });

if (editReviewBtns) addEventsToEditReviewBtns(editReviewBtns);
if (deleteReviewBtns) addEventsToDeleteReviewBtns(deleteReviewBtns);

if (bookingTourSortBtn) sortBtnFunc(bookingTourSortBtn, 'tour', sortBooking);
if (bookingUserSortBtn) sortBtnFunc(bookingUserSortBtn, 'user', sortBooking);
if (bookingDateSortBtn)
  sortBtnFunc(bookingDateSortBtn, 'startDate', sortBooking);
if (bookingCreatedSortBtn)
  sortBtnFunc(bookingCreatedSortBtn, 'createdAt', sortBooking);

if (editBookingBtns) addEventsToEditBookingBtns(editBookingBtns);
if (deleteBookingBtns) addEventsToDeleteBookingBtns(deleteBookingBtns);

if (createBookingForm) {
  const tourElement = document.getElementById('tour');
  const addedArea = document.querySelector('.added-area');

  // TourのselectBoxで選択されると、startDate, price, paid, buttonが登場
  tourElement.addEventListener('change', async e => {
    e.preventDefault();
    addedArea.innerHTML = '';
    const tourId = tourElement.value;
    let el = '';
    const tour = await getTourInfo(tourId);
    // console.log(tour);
    el += await getStartDateSelectBoxAtBookingForm(tour.startDates);
    el += `
      <div class='form__group'>
        <label class='form__label' for='price'>price</label>
        <input id='price' class='form__input' value='${tour.price}' type='text'>
      </div>
    `;
    el += `
      <div class='form__group'>
        <label class='form__label' for='paid'>paid</label>
        <select id='paid' class='form__input'>
          <option value='true' selected>true</option>
          <option value='false'>false</option>
        </select>
      </div>
    `;
    el += `
      <div class='form__group'>
        <button class='btn btn--green'>Create New Booking</button>
      </div>
    `;

    addedArea.innerHTML = el;
  });

  // formのbuttonが押され'submit'イベントが発生したとき
  createBookingForm.addEventListener('submit', e => {
    e.preventDefault();
    // console.log('create button is clicked');
    const form = new URLSearchParams();
    form.append('user', document.getElementById('user').value);
    form.append('tour', document.getElementById('tour').value);
    form.append('startDate', document.getElementById('startDate').value);
    form.append('price', document.getElementById('price').value);
    form.append('paid', document.getElementById('paid').value);
    // console.log(...form.entries());
    createBooking(form);
  });
}


if (deleteReviewBtnsAtMyReviews)
deleteReviewBtnsAtMyReviews.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    console.log(e.target.parentNode.parentNode.dataset.reviewId)
    deleteReviewAtMyReviews(e.target.parentNode.parentNode.dataset.reviewId);
  }))