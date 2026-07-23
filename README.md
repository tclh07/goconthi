# GócÔnThi — Kho đề thi & tài liệu ôn luyện TN THPT 2026

## Cấu trúc thư mục

```
goconthi/
├── index.html              Trang chủ
├── kho-de-thi.html         Kho đề thi (sidebar filter + grid)
├── chi-tiet-de.html        Chi tiết đề (preview + QR thanh toán)
├── goc-si-tu.html          Góc sĩ tử (lộ trình + mẹo ôn thi)
├── ve-chung-toi.html       Về chúng tôi (câu chuyện + FAQ)
├── admin.html              Trang quản trị (admin only)
├── bao-mat.html            Chính sách bảo mật
├── dieu-khoan.html         Điều khoản sử dụng
│
├── css/
│   ├── main.css            Design system + components chung
│   ├── chi-tiet.css        CSS trang chi tiết + QR modal
│   ├── index.css           CSS riêng trang chủ (hero, stats, cards...)
│   ├── kho-de-thi.css      CSS riêng trang kho đề thi
│   ├── goc-si-tu.css       CSS riêng trang góc sĩ tử
│   ├── ve-chung-toi.css    CSS riêng trang về chúng tôi
│   ├── admin.css           CSS riêng trang admin
│   └── static-page.css     CSS chung cho trang bảo mật + điều khoản
│
├── js/
│   ├── app.js              Core (animation reveal + toast)
│   ├── components.js       Navbar + Footer + Search + Login (DÙNG CHUNG)
│   ├── render.js           Render card từ JSON data
│   ├── index.js            Logic riêng trang chủ (countdown, countUp, featured)
│   ├── kho-de-thi.js       Logic riêng trang kho đề thi (filter, sort, search)
│   ├── chi-tiet-de.js      Logic riêng trang chi tiết (payment, copy)
│   ├── goc-si-tu.js        Logic riêng trang góc sĩ tử (load posts)
│   ├── ve-chung-toi.js     Logic riêng trang về chúng tôi (FAQ, counter)
│   └── admin.js            Logic riêng trang admin (login, CRUD, duyệt đơn)
│
├── data/
│   ├── documents.json      Dữ liệu đề thi
│   ├── subjects.json       Dữ liệu 9 môn thi
│   └── posts.json          Dữ liệu bài viết góc sĩ tử
│
└── img/                    Ảnh (QR, logo, thumbnail)
```

## Ghi chú kỹ thuật

- **CDN**: Bootstrap 5.3.3, Bootstrap Icons 1.11.3, Google Fonts (Baloo 2 + Be Vietnam Pro)
- **Auth**: Hệ thống đăng nhập/đăng ký demo dùng localStorage (`got_session`, `got_users`)
- **Thanh toán**: Demo QR VietQR, đơn hàng lưu localStorage (`goconthi_orders`)
- **Admin**: Đăng nhập riêng (admin/admin123), trang tự chứa CSS/JS riêng
