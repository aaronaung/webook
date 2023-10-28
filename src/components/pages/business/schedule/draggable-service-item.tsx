import PriceTag from "@/src/components/ui/price-tag";
import { cn } from "@/src/utils";
import { Tables } from "@/types/db.extension";
import { useDrag } from "react-dnd";
export const DRAGGABLE_SERVICE_ITEM = "draggable-service-item";

type DraggableServiceItemProps = {
  service: Tables<"service">;
};

export default function DraggableServiceItem({
  service,
}: DraggableServiceItemProps) {
  const [collected, drag, dragPreview] = useDrag(
    () => ({
      type: DRAGGABLE_SERVICE_ITEM,
      item: service,
      collect: (monitor) => ({
        isDragging: Boolean(monitor.isDragging()),
      }),
    }),
    [],
  );

  return (
    <li
      ref={drag}
      key={service.id}
      className={cn(
        collected.isDragging && "opacity-40",
        "flex cursor-pointer flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-md p-2 hover:bg-secondary sm:flex-nowrap",
      )}
      {...collected}
    >
      <div>
        <p className="text-sm font-medium leading-6 text-secondary-foreground">
          {service.title}
        </p>
        {service.description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {service.description}
          </p>
        )}
      </div>
      <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
        {service.image_url && (
          <div className="flex -space-x-0.5">
            <dt className="sr-only">Image</dt>
            <dd key={service.id}>
              <img
                className="h-10 w-10 rounded-full bg-gray-50 ring-2 ring-white"
                src={service.image_url}
                alt={service.title}
              />
            </dd>
          </div>
        )}

        <dt>
          <span className="sr-only">Price</span>
          <PriceTag price={service.price} />
        </dt>
      </dl>
    </li>
  );
}
