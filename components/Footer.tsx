import Link from "next/link";
import { DISCLAIMER, GITHUB_REPO_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="grain border-t-2 border-ink mt-6">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="max-w-2xl text-sm text-ink/70 font-light">{DISCLAIMER}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          <Link href="/about" className="text-ink hover:text-coral">
            Why order direct
          </Link>
          <Link href="/local" className="text-ink hover:text-coral">
            Sponsors
          </Link>
          <a
            href={`${GITHUB_REPO_URL}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink hover:text-coral"
          >
            Suggest a change
          </a>
        </div>
      </div>
    </footer>
  );
}
