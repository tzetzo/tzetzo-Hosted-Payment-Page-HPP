import Link from "next/link";

export default function Header() {
  return (
    <div className="w-full z-10 text-blue-600">
      <nav className="container relative flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          href="/"
          className="font-bond text-3xl hover:text-blue-800 focus:text-blue-900 hover:no-underline"
        >
          Home
        </Link>
        <div className="space-x-4 text-xl">
          <Link
            href="/payin/paste_uuid_here"
            className="hover:text-blue-800 focus:text-blue-900 hover:no-underline text-3xl"
          >
            Hosted Payments
          </Link>
        </div>
      </nav>
    </div>
  );
}
