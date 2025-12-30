# 🚀 FastPaste

FastPaste is a real-time group-based text and code sharing platform, inspired by JustPaste but built for speed, collaboration, and simplicity.

Create a group using a 6-character code, share text or code instantly, and collaborate in real time — no login required.

---

## ✨ Features

- 🔑 Create groups with **random 6-character codes**
- 👥 Join groups instantly using a code
- ♻️ Groups persist even when all users leave
- ⚡ **Real-time messaging** with WebSockets
- 📝 Two message modes:
  - Normal text
  - Code snippets
- 📋 **Copy-to-clipboard** button for code messages
- 🔄 Toggle between **Text Mode** and **Code Mode**
- 💾 Messages are stored and loaded when users rejoin
- 🕶️ Clean, minimal UI (JustPaste-like)
- 🙌 Anonymous usage (no authentication)

---

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO

### Database
- MongoDB

---

## 📸 Preview

> Coming soon 🚧

---

## 🧑‍💻 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/fastpaste.git
cd fastpaste
2️⃣ Install dependencies
Backend
bash
Copy code
cd server
npm install
Frontend
bash
Copy code
cd client
npm install
3️⃣ Environment Variables
Create a .env file in the server folder:

env
Copy code
MONGO_URI=your_mongodb_connection_string
PORT=5000
4️⃣ Run the app
Start backend
bash
Copy code
npm run dev
Start frontend
bash
Copy code
npm run dev
🧠 How It Works

A group is created with a unique 6-character code

Users join using the code

Messages are broadcast in real time using Socket.IO

Messages are saved to MongoDB

Code messages include a copy button for quick reuse

🏢 Maintained By

Trione Solutions Pvt Ltd

🚧 Roadmap

 Syntax highlighting for code

 Dark mode

 Message timestamps

 File sharing

 Group expiration settings

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a new branch

Commit your changes

Open a Pull Request

📄 License

MIT License
