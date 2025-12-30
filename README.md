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
- Supabase Client

### Backend
- Supabase (PostgreSQL + Realtime)

---

## 📸 Preview

> Coming soon 🚧

---

## 🧑‍💻 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/fastpaste.git
cd fastpaste
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Environment Variables
Create a `.env` file in the root folder:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Run the app
```bash
npm run dev
```

---

## 🧠 How It Works

1. A group is created with a unique 6-character code
2. Users join using the code
3. Messages are broadcast in real time using Supabase Realtime
4. Messages are saved to PostgreSQL database
5. Code messages include a copy button for quick reuse

---

## 🏢 Maintained By

**Trione Solutions Pvt Ltd**

---

## 🚧 Roadmap

- [x] Syntax highlighting for code
- [x] Dark mode
- [x] Message timestamps
- [x] File sharing
- [ ] Group expiration settings

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

MIT License
