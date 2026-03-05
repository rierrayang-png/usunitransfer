"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface University {
  id: number;
  name: string;
  state: string;
  min_gpa: number;
  accepts_transfer: boolean;
  intl_transfer: boolean;
  transfer_url: string;
  type: string | null;
}

export default function Home() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [minGpa, setMinGpa] = useState(0);
  const [selectedType, setSelectedType] = useState("All");
  const [user, setUser] = useState<User | null>(null);
  const [favouriteIds, setFavouriteIds] = useState<number[]>([]);

  const fetchFavourites = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("favourites")
      .select("university_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching favourites:", error);
    } else {
      setFavouriteIds(data?.map((f) => f.university_id) || []);
    }
  }, []);

  const fetchUniversities = useCallback(async () => {
    const { data, error } = await supabase
      .from("universities")
      .select("*");

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setUniversities(data || []);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUniversities();
  }, [fetchUniversities]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        void fetchFavourites(data.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          void fetchFavourites(session.user.id);
        } else {
          setFavouriteIds([]);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchFavourites]);



  const states = Array.from(
    new Set(universities.map((uni) => uni.state?.trim()))
  ).filter(Boolean).sort();

  const filtered = universities.filter((uni) => {
  const matchesName =
    uni.name?.toLowerCase().includes(query.toLowerCase());

  const matchesState =
    selectedState === "All" ||
    uni.state?.trim() === selectedState;

  const matchesGpa =
    Number(uni.min_gpa) <= minGpa;

  const matchesType =
    selectedType === "All" ||
    uni.type === selectedType;

  return (
    matchesName &&
    matchesState &&
    matchesGpa &&
    matchesType
  );
});

  return (
  <main className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-blue-100 p-10">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
  {user ? (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
      }}
      className="px-4 py-2 bg-gradient-to-r from-blue-300 to-rose-500 text-white rounded-lg shadow-md hover:scale-105 transition"
    >
      Logout
    </button>
  ) : (
    <button
      onClick={async () => {
        const email = prompt("Enter your email:");
        if (!email) return;

        await supabase.auth.signInWithOtp({ email });
        alert("Check your email to log in.");
      }}
      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-blue-300 text-white rounded-lg shadow-md hover:scale-105 transition"
    >
      Login
    </button>
  )}
</div>
      <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-indigo-500 bg-clip-text text-transparent mb-8">
        US Transfer Platform
      </h1>

      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-pink-200 mb-8">
        <h2 className="text-xl font-bold text-pink-700 mb-2">📖 User Manual: Where and how to log in</h2>
        <p className="text-gray-700 mb-2 font-medium">Follow these steps to access your account:</p>
        <ol className="list-decimal list-inside text-gray-600 space-y-1">
          <li>Locate and click the <span className="font-semibold text-rose-500">Login</span> button in the top-right corner of this page.</li>
          <li>An input prompt will appear. Enter your registered email address.</li>
          <li>Check your email inbox (and spam folder) for a <span className="italic">Magic Link</span> from Supabase.</li>
          <li>Click the link in the email to be securely and automatically logged in.</li>
          <li>Once logged in, you can click the ★ icon on any university card to save it to your favourites!</li>
        </ol>
      </div>

      <div className="mb-6">
  <Link
    href="/favourites"
    className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md hover:scale-105 transition"
  >
    ❤️ View My Favourites
  </Link>
</div>


      <input
        type="text"
        placeholder="Search university..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-4 border rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 mb-8"
      />

     <select
  value={selectedState}
  onChange={(e) => setSelectedState(e.target.value)}
  className="p-3 rounded-lg border shadow-md mb-6"
>
  <option value="All">All States</option>

  {states.map((state) => (
    <option key={state} value={state}>
      {state}
    </option>
  ))}
</select>

<select
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
  className="p-3 rounded-lg border shadow-md mb-6"
>
  <option value="All">All Types</option>
  <option value="Public">Public</option>
  <option value="Private">Private</option>
  <option value="Ivy League">Ivy League</option>
  <option value="Art School">Art School</option>
</select>

<div className="mb-6">
  <label className="block mb-2 font-semibold">
    Minimum GPA: {minGpa.toFixed(1)}
  </label>

  <input
    type="range"
    min="0"
    max="4"
    step="0.1"
    value={minGpa}
    onChange={(e) => setMinGpa(Number(e.target.value))}
    className="w-full accent-pink-600"
  />
</div>

      <div className="grid gap-6">
        {filtered.map((uni) => (
          <div
            key={uni.id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-2">
  <h2 className="text-2xl font-semibold text-gray-800">
    {uni.name?.trim()}
  </h2>

  {user && (
    <button
      onClick={async () => {
        const isFav = favouriteIds.includes(uni.id);
        if (isFav) {
          const { error } = await supabase
            .from("favourites")
            .delete()
            .eq("user_id", user.id)
            .eq("university_id", uni.id);
          if (!error) {
            setFavouriteIds((prev) => prev.filter((id) => id !== uni.id));
          }
        } else {
          const { error } = await supabase
            .from("favourites")
            .insert({
              user_id: user.id,
              university_id: uni.id,
            });
          if (!error) {
            setFavouriteIds((prev) => [...prev, uni.id]);
          }
        }
      }}
      className={`${
        favouriteIds.includes(uni.id) ? "text-yellow-500" : "text-gray-300"
      } text-2xl hover:scale-110 transition`}
    >
      ★
    </button>
  )}
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-pink-600">
              <p className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <strong>State:</strong> {uni.state?.trim()}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <strong>Min GPA:</strong> {uni.min_gpa}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <strong>Type:</strong> {uni.type || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <strong>Transfer:</strong>{" "}
                {uni.accepts_transfer ? "✅ Yes" : "❌ No"}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🌍</span>
                <strong>International:</strong>{" "}
                {uni.intl_transfer ? "✅ Yes" : "❌ No"}
              </p>
              {uni.transfer_url && (
  <a
    href={uni.transfer_url.trim()}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-md hover:scale-105 transition"
  >
    Official Transfer Page →
  </a>
)}
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);
}
