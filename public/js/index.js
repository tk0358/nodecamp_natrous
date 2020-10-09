/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview, updateReview } from './review';
import { createLike, deleteLike } from './like';
import { updateTour, createTour, deleteTour } from './tour';

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
const updateTourForm = document.getElementById('form--edit-tour');
const createTourForm = document.getElementById('form--create-tour');
const deleteTourBtns = document.querySelectorAll('.btn--delete-tour');
const selectBoxDifficultyEdit = document.querySelector(
  '.selectbox--difficulty-edit'
);

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

  form.append(
    'ratingsAverage',
    document.getElementById('ratingsAverage').value
  );
  form.append(
    'ratingsQuantity',
    document.getElementById('ratingsQuantity').value
  );
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
  // updateでは画像をアップロードすることも可能
  if (type === 'update') {
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

    console.log(...form.entries());

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
      const tourId = e.target.parentNode.parentNode.id;
      deleteTour(tourId);
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
