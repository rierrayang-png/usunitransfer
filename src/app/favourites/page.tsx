"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
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

interface Favourite {
  university_id: number;
  universities: University;
}

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const fetchFavourites = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("favourites")
      .select(`
        university_id,
        universities (
          id,
          name,
          state,
          min_gpa,
          accepts_transfer,
          intl_transfer,
          transfer_url,
          type
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching favourites:", error);
    } else {
      // @ts-expect-error - Supabase join types can be tricky
      setFavourites(data || []);
    }
  }, []);

  useEffect(() => {
  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setUser(data.user);
      fetchFavourites(data.user.id);
    }
  }

  loadUser();
}, [fetchFavourites]);

  if (!user) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold">
          Please log in to see your favourites.
        </h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          My Favourites ⭐
        </h1>

        {favourites.length === 0 && (
          <p>No favourites yet.</p>
        )}

        <div className="grid gap-6">
          {favourites.map((fav) => (
            <div
              key={fav.university_id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group"
            >
              <button
                onClick={async () => {
                  const { error } = await supabase
                    .from("favourites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("university_id", fav.university_id);
                  if (!error) {
                    setFavourites((prev) =>
                      prev.filter((f) => f.university_id !== fav.university_id)
                    );
                  }
                }}
                className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-500 rounded-full border border-rose-100 hover:bg-rose-100 transition shadow-sm group/btn"
                title="Remove from favourites"
              >
                <span className="text-xl group-hover/btn:scale-110 transition">💔</span>
                <span className="text-sm font-medium">Remove</span>
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 pr-8">
                {fav.universities.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-pink-600">
                <p className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <strong>State:</strong> {fav.universities.state}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <strong>Min GPA:</strong> {fav.universities.min_gpa}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">🏛️</span>
                  <strong>Type:</strong> {fav.universities.type || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">🔄</span>
                  <strong>Transfer:</strong>{" "}
                  {fav.universities.accepts_transfer ? "✅ Yes" : "❌ No"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-xl">🌍</span>
                  <strong>International:</strong>{" "}
                  {fav.universities.intl_transfer ? "✅ Yes" : "❌ No"}
                </p>
                {fav.universities.transfer_url && (
                  <a
                    href={fav.universities.transfer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-md hover:scale-105 transition text-sm"
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
