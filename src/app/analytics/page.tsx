import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getFullAnalytics } from "@/actions/analytics";
import { getCurrentUser } from "@/lib/auth";
import { AnalyticsClient } from "./analytics-client";

export const metadata = {
  title: "Commercial Analytics & Calendar Hub • Buy, Sell & Due Intelligence",
  description:
    "Enterprise multi-tenancy analytics for Buy, Sell, and Due management across daily, monthly, and yearly calendar periods.",
};

export default async function AnalyticsPage() {
  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const currentUser = await getCurrentUser();

  const now = new Date();
  const initialAnalytics = await getFullAnalytics({
    timeframe: "MONTHLY",
    selectedMonth: now.getMonth() + 1,
    selectedYear: now.getFullYear(),
    agencyId: currentAgency?.id,
  });

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnalyticsClient
        currentAgency={currentAgency}
        agencies={agencies}
        initialAnalytics={initialAnalytics}
        currentUser={currentUser}
      />
    </div>
  );
}

