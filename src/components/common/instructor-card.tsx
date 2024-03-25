import { Tables } from "@/types/db";
import { Button } from "../ui/button";
import { getBusinessLogoUrl } from "@/src/utils";
import Image from "../ui/image";

export default function InstructorCard({
  business,
}: {
  business: Tables<"businesses">;
}) {
  return (
    <div className="flex items-center justify-between  rounded-lg bg-white p-4 shadow-md">
      <div className="flex w-full items-center overflow-scroll">
        <Image
          className="h-10 w-10 rounded-full sm:h-16 sm:w-16"
          src={getBusinessLogoUrl(business.handle)}
          fallbackSrc={`https://ui-avatars.com/api/?name=${business.title}`}
          alt="Instructor"
        />
        <div className="ml-4 flex-1">
          <p className="font-semibold text-secondary-foreground">
            {business.title}
          </p>
          <p className="line-clamp-2 text-sm text-gray-400">
            {business.description}
          </p>
        </div>
        <a href={`/${business.handle}`}>
          <Button className="ml-2 min-w-max rounded-full px-4 py-2">
            View profile
          </Button>
        </a>
      </div>
    </div>
  );
}
