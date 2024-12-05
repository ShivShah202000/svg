import Link from "next/link";

function BackButton() {
  return (
    <div className="fixed left-8 top-8 z-50">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#27175D] transition-colors duration-200 hover:text-[#27175D]/70"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back
      </Link>
    </div>
  );
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <BackButton />
      <main className="flex flex-grow flex-col">
        {children}
      </main>
    </div>
  );
}