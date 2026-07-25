# Sagar Super Series 2026

Cricket tournament registration platform — "आपका मंच, आपकी पहचान!"

Auction Base Tournament (Rubber Ball) &middot; 16 Teams &middot; August 2026 &middot; Sagar, Madhya Pradesh

## Stack

- **Frontend:** React + Vite + Tailwind CSS (`/frontend`)
- **Backend:** Node.js + Express (`/backend`)
- **Database:** MongoDB Atlas via Mongoose
- **File storage:** Cloudinary (profile photo, Aadhaar photo, payment screenshot)
- **Auth:** JWT-based admin login, single hardcoded admin account

## Project structure

```
cric/
  backend/     Express API, MongoDB models, Cloudinary integration
  frontend/    React + Vite + Tailwind client
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MongoDB Atlas URI, Cloudinary keys, admin credentials, JWT secret
npm run dev             # nodemon, http://localhost:5000
```

Required env vars (see `backend/.env.example`):

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — hardcoded single admin login
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CLIENT_URL` — frontend origin, used for CORS

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to the backend URL
npm run dev              # http://localhost:5173
```

## Payment details & QR code

Payment bank details are placeholders in `frontend/src/data/tournament.js` (`PAYMENT_DETAILS`) —
replace `[YOUR BANK NAME]`, `[YOUR ACCOUNT NUMBER]`, `[YOUR IFSC CODE]`, `[YOUR UPI ID]` with real values.

The QR code shown on the payment step is `frontend/public/qr-placeholder.svg`. To use a real QR
code, drop your image at `frontend/public/qr-placeholder.svg` (or add a new file and update
`PAYMENT_DETAILS.qrImage` in `tournament.js`).

## API routes

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/register` | Submit a registration (multipart form: fields + images) |
| POST | `/api/auth/login` | Admin login, returns JWT |
| GET | `/api/admin/stats` | Overview stats (auth required) |
| GET | `/api/admin/registrations` | List registrations, supports `search/type/status/city` query params (auth required) |
| GET | `/api/admin/registrations/:id` | Single registration detail (auth required) |
| PATCH | `/api/admin/registrations/:id/approve` | Approve a registration (auth required) |
| PATCH | `/api/admin/registrations/:id/reject` | Reject + delete its Cloudinary files (auth required) |
| GET | `/api/admin/export/csv?status=all\|approved\|pending` | CSV export (auth required) |
| GET | `/api/admin/export/json` | JSON export, approved only (auth required) |
| GET | `/api/admin/activity-log` | Approve/reject audit trail (auth required) |

## Deployment

- **Frontend → Vercel:** set root directory to `frontend`, build command `npm run build`, output
  `dist`, and set `VITE_API_URL` to the deployed backend URL.
- **Backend → Render:** set root directory to `backend`, build command `npm install`, start
  command `npm start`, and add all env vars from `backend/.env.example`. Set `CLIENT_URL` to the
  deployed Vercel URL.
