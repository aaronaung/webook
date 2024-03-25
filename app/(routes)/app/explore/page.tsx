import { getExploreBusinesses } from "@/src/data/business";
import ExploreView from "./_components/explore";
import { supaServerComponentClient } from "@/src/data/clients/server";
import { getExploreClasses } from "@/src/data/class";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const supabaseOptions = { client: supaServerComponentClient() };
  const businesses = await getExploreBusinesses(supabaseOptions);
  const classes = await getExploreClasses(supabaseOptions);

  return <ExploreView businesses={businesses} classes={classes} />;
}
