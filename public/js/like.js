/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createLike = async (user, tour) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/likes',
      data: {
        user,
        tour,
      },
    });
    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteLike = async like => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:3000/api/v1/likes/${like}`,
    });
    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
