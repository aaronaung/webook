export default function PriceTag({ price }: { price?: number | null }) {
  return (
    <span className="ml-1 inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
      ${((price || 0) / 100).toFixed(2)}
    </span>
  );
}
