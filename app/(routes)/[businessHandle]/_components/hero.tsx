import { getBusinessCoverPhotoUrl } from "@/src/utils";
import { Tables } from "@/types/db.extension";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";

export default function Hero({ business }: { business: Tables<"businesses"> }) {
  return (
    <div className="relative isolate overflow-hidden pt-14">
      <Image
        src={getBusinessCoverPhotoUrl(business.handle, business.updated_at)}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        fill
      />
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      <div className="mx-auto max-w-2xl px-8 py-16 lg:py-48">
        <div className="mb-8 flex justify-center">
          <div className="flex">
            <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-600 hover:ring-gray-600/40">
              <span className="whitespace-nowrap font-semibold text-indigo-300">
                What&apos;s new
              </span>
              <span className="h-4 w-px bg-gray-400" aria-hidden="true" />
              <a
                href="#"
                className="flex max-w-[200px] items-center gap-x-1 text-gray-200"
              >
                <span className="absolute inset-0" aria-hidden="true" />
                New location open now!
                <ChevronRightIcon
                  className="-mr-2 h-5 w-5 text-gray-300"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {business.title}
          </h1>
          <p className="text-lg leading-8 text-gray-300">
            {business.description}
          </p>
          <Link
            href={`/${business.handle}/schedule`}
            className="mt-4 max-w-[200px] rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            See schedule
          </Link>
        </div>
      </div>

      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
}
