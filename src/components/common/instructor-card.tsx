import { Tables } from "@/types/db";

export default function InstructorCard({
  business,
}: {
  business: Tables<"businesses">;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center">
        <img
          className="h-16 w-16 rounded-full"
          src={
            business.logo_url || `https://i.pravatar.cc/150?u=${business.id}`
          }
          alt="Instructor"
        />
        <div className="ml-4">
          <p className="font-semibold text-secondary-foreground">
            {business.title}
          </p>
          <p className="text-sm text-gray-400">{business.description}</p>
        </div>
      </div>
      <a href={`/${business.handle}`}>
        <button className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white">
          View Profile
        </button>
      </a>
    </div>
  );
}
