# Mini ERP + CRM Documentation

This folder contains submission and project documentation for the Mini ERP + CRM Operations Portal.

## Submission details

- Repository: [CHILIVERIMEGHANA13/mini-erp-crm](https://github.com/CHILIVERIMEGHANA13/mini-erp-crm)
- Frontend URL: Add the deployed Vercel URL before final submission.
- Backend API URL: Add the deployed backend URL before final submission.
- API collection: [`mini_erp_crm.postman_collection.json`](../mini_erp_crm.postman_collection.json)
- Full project guide: [`README.md`](../README.md)
- Submission PDF: [`mini_erp_crm_submission_requirements.pdf`](../output/pdf/mini_erp_crm_submission_requirements.pdf)

## Test credentials

All test accounts use the password `Password123!`.

| Role | Email |
| --- | --- |
| Admin | `admin@minierp.com` |
| Sales | `sales@minierp.com` |
| Warehouse | `warehouse@minierp.com` |
| Accounts | `accounts@minierp.com` |

## Run locally

Start the API:

```bash
cd backend
npm install
npm run prisma:push
npm run seed
npm run dev
```

In a separate terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and the backend runs at `http://localhost:5000`.
