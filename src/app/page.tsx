"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";


export default function Home() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [minGpa, setMinGpa] = useState(0);
  const [selectedType, setSelectedType] = useState("All");
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);


  async function fetchUniversities() {
    const { data, error } = await supabase
      .from("universities")
      .select("*");

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setUniversities(data || []);
    }
  }

  const states = Array.from(
  new Set(universities.map((uni) => uni.state))
);
  const filtered = universities.filter((uni) => {
  const matchesName =
    uni.name?.toLowerCase().includes(query.toLowerCase());

  const matchesState =
    selectedState === "All" ||
    uni.state === selectedState;

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
    {uni.name}
  </h2>

  {user && (
    <button
      onClick={async () => {
        await supabase.from("favourites").insert({
          user_id: user.id,
          university_id: uni.id,
        });
        alert("Added to favourites ⭐");
      }}
      className="text-yellow-500 text-2xl hover:scale-110 transition"
    >
      ⭐
    </button>
  )}
</div>

            <div className="grid grid-cols-2 gap-4 text-pink-600">
              <p><strong>State:</strong> {uni.state}</p>
              <p><strong>Min GPA:</strong> {uni.min_gpa}</p>
              <p>
                <strong>Transfer:</strong>{" "}
                {uni.accepts_transfer ? "✅ Yes" : "❌ No"}
              </p>
              <p>
                <strong>International:</strong>{" "}
                {uni.intl_transfer ? "🌍 Yes" : "❌ No"}
              </p>
              {uni.transfer_url && (
  <a
    href={uni.transfer_url}
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
