"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setUser(data.user);
      fetchFavourites(data.user.id);
    }
  }

  loadUser();
}, []);


  async function fetchFavourites(userId: string) {
    const { data, error } = await supabase
  .from("favourites")
  .select(`
    university_id,
    universities (
      id,
      name,
      state,
      min_gpa
    )
  `)
  .eq("user_id", userId);

console.log("Favourites data:", data);
console.log("Favourites error:", error);

setFavourites(data || []);
  }

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
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-2xl font-semibold">
                {fav.universities.name}
              </h2>
              <p>State: {fav.universities.state}</p>
              <p>Min GPA: {fav.universities.min_gpa}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
