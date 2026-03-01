import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eqqfihrwccldzropqouu.supabase.co";
const supabaseKey = "sb_publishable_A8i2N1cwGAK8BOc440WJkg_Ys5OL478";

export const supabase = createClient(supabaseUrl, supabaseKey);