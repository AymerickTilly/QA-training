import { test, expect } from '@playwright/test';

const BASE_URL = 'https://restful-booker.herokuapp.com';

test('GET /booking - should return a list of bookings', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/booking`);
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
});

test('GET /booking/{id} - should return booking details', async ({ request }) => {

    const response = await request.get(`${BASE_URL}/booking/1`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('firstname');
    expect(body).toHaveProperty('lastname');
    expect(body).toHaveProperty('totalprice');
    expect(body).toHaveProperty('depositpaid');
    expect(body).toHaveProperty('bookingdates');
    expect(body.bookingdates).toHaveProperty('checkin');
    expect(body.bookingdates).toHaveProperty('checkout');
});

test('POST /booking - should create a new booking', async ({ request }) => {

    const newBooking = {
        firstname: 'John',
        lastname: 'Doe',
        totalprice: 150,
        depositpaid: true,
        bookingdates: {
            checkin: '2024-07-01',
            checkout: '2024-07-10'
        },
        additionalneeds: 'Breakfast'
    };

    const response = await request.post(`${BASE_URL}/booking`, {

        data: newBooking

    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('bookingid');
    expect(body.booking.firstname).toBe(newBooking.firstname);
    expect(body.booking.lastname).toBe(newBooking.lastname);
    expect(body.booking.totalprice).toBe(newBooking.totalprice);
    expect(body.booking.depositpaid).toBe(newBooking.depositpaid);
    expect(body.booking.bookingdates.checkin).toBe(newBooking.bookingdates.checkin);
    expect(body.booking.bookingdates.checkout).toBe(newBooking.bookingdates.checkout);
    expect(body.booking.additionalneeds).toBe(newBooking.additionalneeds);
});


test('DELETE /booking deletes a booking', async ({ request }) => {
  // Step 1 — Create a booking to delete
  const createResponse = await request.post(`${BASE_URL}/booking`, {
    data: {
      firstname: 'Test',
      lastname: 'Delete',
      totalprice: 100,
      depositpaid: false,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-03'
      }
    }
  });
  const { bookingid } = await createResponse.json();

  // Step 2 — Get auth token
  const authResponse = await request.post(`${BASE_URL}/auth`, {
    data: {
      username: 'admin',
      password: 'password123'
    }
  });
  const { token } = await authResponse.json();

  // Step 3 — Delete the booking
  const deleteResponse = await request.delete(`${BASE_URL}/booking/${bookingid}`, {
    headers: {
      Cookie: `token=${token}`
    }
  });

  expect(deleteResponse.status()).toBe(201);
});
