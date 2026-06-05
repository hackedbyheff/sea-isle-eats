import {
  getAllRestaurants,
  getModerationQueue,
  isDemoMode,
} from "@/lib/admin-data";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

// Always render fresh — the queue reflects live edits and moderation actions.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Auth is enforced by middleware (redirects to /admin/login when a Supabase
  // session is required and missing). In demo mode there's no auth.
  const [restaurants, moderation] = await Promise.all([
    getAllRestaurants(),
    getModerationQueue(),
  ]);

  return (
    <AdminWorkspace
      initialRestaurants={restaurants}
      initialSuggestions={moderation.suggestions}
      initialClaims={moderation.claims}
      demo={isDemoMode()}
    />
  );
}
