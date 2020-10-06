/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview, updateReview } from './review';
import { createLike, deleteLike } from './like';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
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
        <input class="form__input" id="soldOut${count}" type="text">
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
