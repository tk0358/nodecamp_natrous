/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import {
  getTourSelectBox,
  getUserSelectBox,
  getStartDateSelectBox,
} from './selectBox';

export const sortBooking = async field => {
  try {
    // console.log(field);
    let res;
    if (field) {
      // console.log('field is not undefined');
      res = await axios({
        method: 'GET',
        url: `/api/v1/bookings?sort=${field}`,
      });
    } else {
      // console.log('field is undefined');
      res = await axios({
        method: 'GET',
        url: '/api/v1/bookings?sort=-createdAt',
      });
      // 'http://.../api/v1/reviews'は'http://.../api/vi/reviews?sort=-createdAt'と同じ結果が返ってくる(apiFeaturesのsort()参照)
    }
    const bookings = res.data.data.data;
    // console.log(bookings);
    let el = '';
    bookings.forEach(booking => {
      el += `
        <tr id=${booking._id}>
          <td data-tour-id=${booking.tour.id}>${booking.tour.name}</td>
          <td data-user-id=${booking.user._id}>${booking.user.name}</td>
          <td>${booking.startDate}</td>
          <td>${booking.price}</td>
          <td>${booking.paid}</td>
          <td>${booking.createdAt}</td>
          <td>
            <button class='btn btn--yellow btn--small btn--edit-booking'>Edit</button>
            <button class='btn btn--red btn--small btn--delete-booking'>Delete</button>
          </td>
        </tr>
      `;
    });
    document.querySelector('.bookings-table tbody').innerHTML = el;
    document.querySelector('.bookings-table').dataset.sortField = field;
    addEventsToEditBookingBtns(document.querySelectorAll('.btn--edit-booking'));
    addEventsToDeleteBookingBtns(
      document.querySelectorAll('.btn--delete-booking')
    );
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const addEventsToEditBookingBtns = editBookingBtns => {
  editBookingBtns.forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const tourId = e.target.parentNode.parentNode.children[0].dataset.tourId;
      const userId = e.target.parentNode.parentNode.children[1].dataset.userId;
      const startDate = e.target.parentNode.parentNode.children[2].textContent;
      const price = e.target.parentNode.parentNode.children[3].textContent;
      const paid = e.target.parentNode.parentNode.children[4].textContent;
      const createdAt = e.target.parentNode.parentNode.children[5].textContent;

      // console.log(tourId, userId, startDate, price, paid, createdAt);

      let el = '';
      el += await getTourSelectBox(tourId);
      el += await getUserSelectBox(userId);
      el += await getStartDateSelectBox(tourId, startDate);
      el += `<td><input id='price' type='text' value='${price}'></td>`;
      el += `<td><select id='paid'><option value='true'>true</option><option value='false'>false</option></select></td>`;
      el += `<td>${createdAt}</td>`;
      el += `
          <td>
            <button class='btn btn--blue btn--small btn--update-booking'>Update</button>
            <button class='btn btn--green btn--small btn--cancel'>Cancel</button>
          </td>
        `;
      const updateBookingBtn = document.querySelector('.btn--update-booking');
      // edit => update ボタンへの変更は１か所のみ
      if (!updateBookingBtn) {
        e.target.parentNode.parentNode.innerHTML = el;
      }
      if (paid === 'true') {
        document.getElementById('paid').options[0].selected = true;
      } else {
        document.getElementById('paid').options[1].selected = true;
      }

      document
        .querySelector('.btn--update-booking')
        .addEventListener('click', updateBookingFunc);
      document.querySelector('.btn--cancel').addEventListener('click', e => {
        e.preventDefault();
        sortBooking(
          document.querySelector('.bookings-table').dataset.sortField
        );
      });
    });
  });
};

const updateBookingFunc = e => {
  e.preventDefault();
  const bookingId = e.target.parentNode.parentNode.id;
  const form = new URLSearchParams();
  form.append('tour', document.getElementById('tour').value);
  form.append('user', document.getElementById('user').value);
  form.append('startDate', document.getElementById('startDate').value);
  form.append('price', document.getElementById('price').value);
  form.append('paid', document.getElementById('paid').value);
  // console.log(...form.entries());
  updateBookingFromAdmin(bookingId, form);
};

const updateBookingFromAdmin = async (bookingId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/bookings/${bookingId}`,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'This booking is updated successfully');
      window.setTimeout(() => {
        sortBooking(
          document.querySelector('.bookings-table').dataset.sortField
        );
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const addEventsToDeleteBookingBtns = deleteBookingBtns => {
  deleteBookingBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const dialog = window.confirm('本当にこの予約を削除しますか？');
      if (dialog) {
        const bookingId = e.target.parentNode.parentNode.id;
        deleteBookingFromAdmin(bookingId);
      } else {
        sortBooking(document.querySelector('.reviews-table').dataset.sortField);
      }
    });
  });
};

const deleteBookingFromAdmin = async bookingId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${bookingId}`,
    });
    // console.log(res);
    if (res.status === 204) {
      showAlert('success', 'This booking is deleted successfully!');
      window.setTimeout(() => {
        sortBooking(
          document.querySelector('.bookings-table').dataset.sortField
        );
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const createBooking = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/bookings',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'New booking is created successfully!');
      window.setTimeout(() => {
        location.assign('/manage/bookings');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
