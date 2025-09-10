import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// AnimeVoteApp with smooth effects and voting limits

const SAMPLE_ANIME = [
  { id: "1", title: "Demon Slayer", img: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg" },
  { id: "2", title: "Attack on Titan", img: "https://cdn.myanimelist.net/images/anime/10/47347.jpg" },
  { id: "3", title: "My Hero Academia", img: "https://cdn.myanimelist.net/images/anime/10/78745.jpg" },
  { id: "4", title: "Naruto", img: "https://cdn.myanimelist.net/images/anime/13/17405.jpg" },
  { id: "5", title: "One Piece", img: "https://cdn.myanimelist.net/images/anime/6/73245.jpg" },
  { id: "6", title: "Jujutsu Kaisen", img: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg" }
];

const STORAGE_KEYS = {
  votes: "av_votes_v1",
  userRecord: "av_user_v1",
  tasks: "av_tasks_v1"
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function App() {
  const [anime] = useState(SAMPLE_ANIME);
  const [votes, setVotes] = useState(() => loadFromStorage(STORAGE_KEYS.votes, {}));
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.userRecord, { votesCast: 0, tasksCompleted: 0 }));
  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.tasks, [
    { id: 1, title: "Complete Offer 1", done: false, url: "https://example.com/offer1" },
    { id: 2, title: "Complete Offer 2", done: false, url: "https://example.com/offer2" }
  ]));

  useEffect(() => saveToStorage(STORAGE_KEYS.votes, votes), [votes]);
  useEffect(() => saveToStorage(STORAGE_KEYS.userRecord, user), [user]);
  useEffect(() => saveToStorage(STORAGE_KEYS.tasks, tasks), [tasks]);

  function canVote() {
    if (user.votesCast < 2) return true;
    return user.tasksCompleted >= 1; // unlock extra votes if at least 1 task completed
  }

  function castVote(animeId) {
    if (!canVote()) {
      alert("You reached your free voting limit. Complete tasks to unlock more votes.");
      return;
    }
    setVotes(prev => {
      const next = { ...prev };
      next[animeId] = (next[animeId] || 0) + 1;
      return next;
    });
    setUser(prev => ({ ...prev, votesCast: prev.votesCast + 1 }));
    alert("Thanks — your vote was recorded!");
  }

  function completeTask(id, url) {
    window.open(url, "_blank");
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
    setUser(prev => ({ ...prev, tasksCompleted: prev.tasksCompleted + 1 }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold">Anime Fan Vote</h1>
          <div className="text-sm">Votes cast: {user.votesCast}</div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 grid gap-6">
            {anime.map(a => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <VoteCard anime={a} votes={votes[a.id] || 0} onVote={() => castVote(a.id)} />
              </motion.div>
            ))}
          </section>

          <aside className="rounded-2xl bg-slate-800/40 p-4 shadow-xl">
            <h3 className="font-semibold mb-3">Tasks to unlock extra votes</h3>
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center justify-between text-sm">
                  <span className={task.done ? "line-through text-slate-400" : ""}>{task.title}</span>
                  {!task.done && (
                    <button onClick={() => completeTask(task.id, task.url)} className="rounded bg-pink-600 px-2 py-1 text-xs">Do Task</button>
                  )}
                  {task.done && <span className="text-green-400">Done</span>}
                </li>
              ))}
            </ul>
          </aside>
        </main>
      </div>
    </div>
  );
}

function VoteCard({ anime, votes, onVote }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-700/40 to-slate-700/10 p-4 flex items-center gap-6 shadow-lg hover:scale-[1.02] transition-transform">
      <img src={anime.img} alt={anime.title} className="w-28 h-28 rounded-lg object-cover shadow-md" />
      <div className="flex-1">
        <h4 className="font-semibold text-xl">{anime.title}</h4>
        <div className="text-sm text-slate-300">Votes: <strong>{votes}</strong></div>
      </div>
      <button onClick={onVote} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500 transition">Vote</button>
    </div>
  );
}
