import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/components/ui/card";
import { getServicesWithAvailabilitySchedule } from "@/src/data/service";
import { useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";

export default function BookServicesCard({
  business,
}: {
  business: Tables<"businesses">;
}) {
  const { data, isLoading } = useSupaQuery(
    getServicesWithAvailabilitySchedule,
    business.id,
    {
      queryKey: ["getServicesWithAvailabilitySchedule", business.id],
    },
  );

  if (isLoading) {
    return <>Loading...</>;
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardDescription>
          Click on each service to see its availability schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul role="list" className="space-y-2 divide-y divide-gray-100 text-sm">
          {(data || []).map((service) => (
            <div
              key={service.id}
              className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
            >
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${service.title}`}
                  alt=""
                />
              </div>
              <div className="min-w-0 flex-1">
                <a href="#" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    {service.title}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {service.description}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    $100 per hour
                  </p>
                </a>
              </div>
            </div>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
