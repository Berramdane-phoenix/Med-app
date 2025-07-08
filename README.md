# 💊 Medicare – Your Personalized Health Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)   
[![Platform](https://img.shields.io/badge/Platform-React-blue)](https://reactjs.org/)

---

## Medicare — Full-Stack Medical Dashboard

This project is my **FIRST full-stack application**, built independently as a self-taught developer. I began by prototyping the UI using Bolt.new, which was incredibly helpful for rapidly visualizing ideas and exploring design directions early on. Bolt’s intuitive interface accelerated my creative process. Building on that foundation, I refined the content structure and enhanced the layout logic to create fully customizable components, integrate backend functionality, and gain deeper control over the full stack — all while using Bolt as a launchpad for ideation.

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

- 🧑‍⚕️ Browse and filter doctors by specialty, language, location, and rating  
- 📄 View detailed doctor profiles with experience, education, reviews, and contact info  

- Book appointments with real-time slot availability
•	View summary before submission
•	Receive confirmation notifications
•	Set appointment reminders (1 hour before)
•	Reschedule, cancel, or delete appointments
•	Filter past and upcoming appointments

💊 Medical Records & Medications

•	View and download medical records
•	Medication management with reorder option

🔔 Notifications & Reminders

•	Real-time notifications (read/unread tracking)
•	Custom reminders with priority levels (High, Medium, Low) 
 
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

-  🔗 Live Demo: https://phoenix-medicare-application.netlify.app
- 🔗 GitHub Repo: https://github.com/Berramdane-phoenix/Med-app
- 🔗 Bolt.new Prototype: https://bolt.new/~/sb1-nkpxj9q5  
- 🔗 Supabase Org: https://supabase.com/dashboard/project/kbvtwzezqhwxlvplxong


---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
