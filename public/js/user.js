/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateUser = async (data, userId) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${userId}`,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'User is updated successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteUser = async userId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/users/${userId}`,
    });
    if (res.status === 204) {
      showAlert('success', 'This user is deleted successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const createUser = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'New user is created successfully!');
      window.setTimeout(() => {
        location.assign('/manage/users');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
