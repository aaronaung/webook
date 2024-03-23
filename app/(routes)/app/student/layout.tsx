import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto h-full max-w-7xl px-4 lg:flex lg:gap-x-2">
      {/* <Navbar businesses={data?.businesses || []} /> */}
      <main className="h-full w-full overflow-x-auto py-4 pb-28 lg:flex-auto lg:px-0 lg:pb-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
