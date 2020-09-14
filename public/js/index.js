/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview } from './createReview';
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
    // console.log(rating, review, user, tour);
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
