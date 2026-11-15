@'

\# Habitly – Habit \& Daily Goal Tracker



Habitly is a full-stack web application that helps users build consistent daily habits, track goals, monitor progress, and view their completion history.



\## Features



\- Dashboard with habit cards and daily progress

\- Add, edit, and delete habits

\- Mark habits as completed or undo completion

\- Weekly progress charts and streak tracking

\- Calendar view with historical completion records

\- Analytics and category-wise progress

\- Achievements and milestones

\- Responsive interface for desktop and mobile

\- Toast notifications and API connection status

\- Persistent data storage using SQLite



\## Technology Stack



\### Frontend

\- React

\- Vite

\- JavaScript

\- CSS

\- Axios

\- React Router

\- Recharts

\- Lucide React



\### Backend

\- Node.js

\- Express.js

\- SQLite

\- better-sqlite3

\- REST API



\## Project Structure



```text

Habitly/

├── frontend/

│   ├── public/

│   ├── src/

│   ├── docs/

│   ├── package.json

│   └── .env.example

│

├── backend/

│   ├── config/

│   ├── controllers/

│   ├── database/

│   │   ├── schema.sql

│   │   └── seed.js

│   ├── middleware/

│   ├── routes/

│   ├── services/

│   ├── tests/

│   ├── utils/

│   ├── server.js

│   └── package.json

│

├── .gitignore

└── README.md

