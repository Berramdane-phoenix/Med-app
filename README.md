# 💊 Medicare – Your Personalized Health Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)  
[![Build Status](https://img.shields.io/github/actions/workflow/status/Berramdane-phoenix/Medicare-app/ci.yml?branch=main)](https://github.com/Berramdane-phoenix/Medicare-app/actions)  
[![Version](https://img.shields.io/github/package-json/v/Berramdane-phoenix/Medicare-app)](https://github.com/Berramdane-phoenix/Medicare-app/releases)  
[![Platform](https://img.shields.io/badge/Platform-React-blue)](https://reactjs.org/)

---

## Medicare — Full-Stack Medical Dashboard

This project represents my first full-stack application, built entirely as a self-taught developer. It began with UI prototyping on Bolt.new, which was helpful in early design exploration. However, when the free token expired and I found only static styles downloadable — without reusable components or logic — I chose to rebuild the app completely from scratch. This approach gave me full control over all components, application logic, and backend integration.

### Project Overview

Medicare is a medical dashboard app designed to display patient vitals data fetched from a Supabase backend. Currently, the dashboard supports read-only data visualization with plans to implement full CRUD (Create, Read, Update, Delete) functionality for vitals in future iterations.

This project is not only a technical exercise but a personal milestone reflecting my growth, resilience, and commitment to self-driven learning.

### Developer’s Note

This project represents my **first experience building a full-stack application** as a self-taught developer. I started with **Bolt.new** to quickly prototype UI designs.

When the free token expired, I realized that the SCSS styles were present but not embedded directly in the elements. Fortunately, all components that used Tailwind were preserved. Since then, I’ve significantly improved the components’ logic and content.

This application is not just a technical milestone but a personal achievement in resilience and growth.

---

### Timezone Handling

Consistent and user-friendly time management is a critical feature of Medicare, given its healthcare context:

- All timestamps are stored in **UTC** within the Supabase database to ensure a standardized reference time.  
- On the frontend, timestamps are dynamically converted to the user’s **local timezone** for display, improving clarity and usability.  
- The app detects the user's timezone via the browser API:

```js
Intl.DateTimeFormat().resolvedOptions().timeZone
```

For reliable date-time manipulation and formatting, the app utilizes date-fns and date-fns-tz, enabling precise timezone conversions and human-readable formats.

This design guarantees that all users see date and time data relevant to their location while maintaining consistent storage on the backend.

Future enhancements may include persisting user timezone preferences in their profile for even more personalized time handling.

## 🚀 Features

- 💊 Set reminders for medications, checkups, or custom alerts  
- 🧑‍⚕️ Browse and filter doctors by specialty, language, location, and rating  
- 📄 View detailed doctor profiles with experience, education, reviews, and contact info  
- 📅 Book, reschedule, cancel, or delete appointments from the database with real-time availability  
- 🔐 Two-Factor Authentication (2FA), session management, and secure user profiles powered by Supabase  
- 📤 Export personal health data for sharing or backup  

---

## 🛠️ Tech Stack

- Frontend: React, HTML, SCSS, JavaScript  
- Backend: Supabase (Auth + PostgreSQL)  
- Deployment: Netlify  
- State Management: Zustand  
- Date/UI Tools: React DatePicker, Lucide Icons  


# 1. Clone the repository
```
git clone https://github.com/Berramdane-phoenix/Medicare-app.git
cd Medicare-app
```

# 2. Install dependencies
```
npm install
```
# 3. Add environment variables to .env.local
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
# 4. Start the development server
```
npm run dev
```

## 🧠 Team

- [Berramdane-phoenix] – Now!  Full-Stack Developer

---

## 📎 Submission Links

- 🔗 Live Demo: https://phoenix-medicare-app.netlify.app
- 🔗 GitHub Repo: https://github.com/Berramdane-phoenix/Medicare-app  
- 🔗 Bolt.new Prototype: https://bolt.new/~/sb1-nkpxj9q5  
- 🔗 Supabase Org: https://supabase.com/dashboard/project/kbvtwzezqhwxlvplxong


---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.