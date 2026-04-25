import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Tăng lên 50 người dùng
    { duration: '1m', target: 50 },   // Duy trì 50 người dùng
    { duration: '30s', target: 0 },   // Hạ nhiệt
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% yêu cầu phải phản hồi dưới 500ms
  },
};

export default function () {
  const res = http.get('https://api.thaitienshop.id.vn/api/products');
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);
}
