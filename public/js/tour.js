/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createTour = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/tours',
      data,
    });

    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'New tour is created successfully!');
      window.setTimeout(() => {
        location.assign('/manage/tours');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateTour = async (data, tourId) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/tours/${tourId}`,
      data,
    });

    console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Tour is updated successfully!');
      window.setTimeout(() => {
        location.assign('/manage/tours');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
