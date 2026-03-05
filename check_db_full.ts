import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eqqfihrwccldzropqouu.supabase.co";
const supabaseKey = "sb_publishable_A8i2N1cwGAK8BOc440WJkg_Ys5OL478";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from("universities")
    .select("*")
    .limit(1);

  if (error) {
    console.error(error);
  } else {
    console.log(Object.keys(data[0]));
  }
}

check();
