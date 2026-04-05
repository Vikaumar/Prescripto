<div align="center">
  <h1>💊 Prescripto</h1>
  <b>Understand your prescription in simple words.</b>
  
  <br />
  <br />

  <p>
    An intelligent, modern platform for managing prescriptions, family health, and medical reminders. Built with AI to simplify complex medical jargon.
  </p>

  <!-- Live Link Placeholder -->
  > 🌐 **Live Demo:** *Coming Soon!*

</div>

<hr />

## 📸 Screenshots

> 🚧 **Note:** Screenshots are currently being prepared and will be added here shortly to showcase our beautiful interface!

<div align="center">
  <table>
    <tr>
      <td align="center"><em>Dashboard Preview</em><br/><br/>[🖼️ Placeholder]</td>
      <td align="center"><em>AI Analysis Result</em><br/><br/>[🖼️ Placeholder]</td>
    </tr>
    <tr>
      <td align="center"><em>Prescription Upload</em><br/><br/>[🖼️ Placeholder]</td>
      <td align="center"><em>Profile Management</em><br/><br/>[🖼️ Placeholder]</td>
    </tr>
  </table>
</div>

---

## 🌟 Overview

**Prescripto** is a comprehensive medical management application designed to simplify the way patients and their caregivers handle prescriptions. By leveraging AI, Prescripto can extract text from prescription images and provide simplified explanations of medicines, diagnoses, and doctor's notes. 

Built with a stunning modern user interface, the platform offers smart prescription analysis, seamless camera integration for document scanning, and robust features for user management.

---

## ✨ Key Features

- **📸 Smart Prescription Uploads**: Easily upload prescriptions or scan them directly using your device's camera.
- **🤖 AI-Powered Analysis**: Extract and analyze prescription details automatically. Understand your medicines and doctors' notes in plain language.
- **🌍 Multi-Language Support**: Translate the AI analysis into various languages (Hindi, Spanish, French, etc.) instantly.
- **🔐 Secure Authentication**: JWT-based authentication to keep your medical data private and secure.
- **👤 User Dashboard**: Manage your profile, view prescription history, and update your avatar.
- **🌗 Modern UI/UX**: A beautiful, dynamic design featuring sleek animations and a fully responsive layout built with React.

---

## 🚀 Tech Stack

### Frontend
- **React.js** (Vite): For a lightning-fast, dynamic, and responsive UI.
- **Vanilla CSS**: Custom styling with an emphasis on rich aesthetics, smooth gradients, glassmorphism, and micro-animations.
- **React Router Dom**: For seamless client-side routing.

### Backend
- **Node.js & Express.js**: Scalable and asynchronous RESTful API architecture.
- **MongoDB & Mongoose**: Flexible NoSQL database for structured storage of users and prescriptions.
- **JSON Web Tokens (JWT)**: Secure user authentication and session management.
- **Groq API**: High-performance AI processing for OCR and medical text simplification.

---

## 🛠 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- **Groq API Key**: Needed for the AI features.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vikaumar/Prescripto.git
   cd Prescripto
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory:*
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   GROQ_API_KEY=your_groq_api_key
   ```
   *Start the backend server:*
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   # Open a new terminal from the root folder
   cd frontend
   npm install
   ```
   *Create a `.env` file in the `frontend` directory:*
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *Start the frontend development server:*
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` to explore Prescripto!

---

## 🎨 Design Philosophy

Aesthetics are a core functionality in Prescripto. The application features:
- A curated, harmonious color palette prioritizing user readability and comfort.
- Smooth transitions and hover states that make the interface feel responsive and alive.
- Clean typography and strategic use of glassmorphism.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Vikaumar/Prescripto/issues) if you want to contribute.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br />

<div align="center">
  <i>Built with ❤️ by the Prescripto Team</i>
</div>
