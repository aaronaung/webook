import EmptyState from "@/components/pages/app/business/empty-state";
import { getLoggedInUserBusinesses } from "@/lib/supabase/api/api";
import { supaServerComponentClient } from "@/lib/supabase/server-side";
import _ from "lodash";

export default async function Business() {
  const { businesses } = await getLoggedInUserBusinesses({
    client: supaServerComponentClient(),
  });
  if (_.isEmpty(businesses)) {
    return <EmptyState />;
  }
  return <>Dashboard page</>;
}
