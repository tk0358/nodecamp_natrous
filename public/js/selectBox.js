import axios from 'axios';
import { showAlert } from './alerts';

export const getTourSelectBox = async tourId => {
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

export const getUserSelectBox = async userId => {
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

export const getStartDateSelectBox = async (tourId, date) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/tours/${tourId}`,
    });
    const startDates = res.data.data.data.startDates;
    // console.log(startDates);
    let el = '';
    el += "<td><select id='startDate'>";
    startDates.forEach(startDate => {
      if (startDate.startDate === date) {
        el += `<option value='${startDate.startDate}' selected>${startDate.startDate}</option>`;
      } else {
        el += `<option value='${startDate.startDate}'>${startDate.startDate}</option>`;
      }
    });
    el += '</select></td>';
    return el;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const getStartDateSelectBoxAtBookingForm = async startDates => {
  // const res = await axios({
  //   method: 'GET',
  //   url: `http://127.0.0.1:3000/api/v1/tours/${tourId}`,
  // });
  // const startDates = res.data.data.data.startDates;
  // // console.log(startDates);
  let el = '';
  el += `<div class='form__group'>
  <label class='form__label' for='startDate'>startDate</label>
  <select id='startDate' class='form__input'>`;
  startDates.forEach(startDate => {
    el += `<option value='${startDate.startDate}'>${startDate.startDate}</option>`;
  });
  el += `</select></div>`;
  return el;
};
