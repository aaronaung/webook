import { Tables } from "@/types/db";
import { Button } from "../ui/button";

export default function InstructorCard({
  business,
}: {
  business: Tables<"businesses">;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center">
        <img
          className="h-10 w-10 rounded-full sm:h-16 sm:w-16"
          src={
            business.logo_url || `https://i.pravatar.cc/150?u=${business.id}`
          }
          alt="Instructor"
        />
        <div className="ml-4">
          <p className="font-semibold text-secondary-foreground">
            {business.title}
          </p>
          <p className="line-clamp-2 text-sm text-gray-400">
            {business.description}
          </p>
        </div>
      </div>
      <a href={`/${business.handle}`}>
        <Button className="ml-2 min-w-max rounded-full px-4 py-2">
          View profile
        </Button>
      </a>
    </div>
  );
}
