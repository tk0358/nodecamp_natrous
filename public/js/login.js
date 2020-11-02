/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      // 2段階認証部なのでテストの為コメントアウト
      // const { serviceId } = res.data
      // showAlert('success', 'We sent SMS code to your phone! Please confirm it!');
      // window.setTimeout(() => {
      //   location.assign(`/sms-auth?serviceId=${serviceId}`);
      // }, 1500);

      // テストの為の簡易ログイン用コード
      if (res.data.status === 'success') {
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const smsAuth = async (serviceId, code) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/smsAuth',
      data: {
        serviceId,
        code
      }
    })
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Please confirm your email!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
