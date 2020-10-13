/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateUser = async (data, userId) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/users/${userId}`,
      data,
    });
    console.log(res);
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
      url: `http://127.0.0.1:3000/api/v1/users/${userId}`,
    });
    console.log(res);
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
