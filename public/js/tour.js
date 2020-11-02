/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createTour = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/tours',
      data,
    });

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
      url: `/api/v1/tours/${tourId}`,
      data,
    });


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

export const deleteTour = async tourId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`,
    });
    if (res.status === 204) {
      showAlert('success', 'This tour is deleted successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const getTourInfo = async tourId => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/tours/${tourId}`,
    });
    const tour = res.data.data.data;
    return tour;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
