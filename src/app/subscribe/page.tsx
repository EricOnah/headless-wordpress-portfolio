import Link from "next/link";
import { SubscriptionAction } from "@/components/subscription-action";
export const metadata = { title: "Email subscription | Eric Onah", robots: { index: false, follow: false } };
export default async function SubscribePage({ searchParams }: { searchParams: Promise<{ action?: string; token?: string }> }) {
  const params = await searchParams;
  const action = params.action === "confirm" || params.action === "unsubscribe" ? params.action : null;
  const token = typeof params.token === "string" && params.token.length <= 200 ? params.token : "";
  return <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-6 py-16">
    <h1 className="text-3xl font-semibold text-white">{action === "unsubscribe" ? "Unsubscribe from post updates" : "Confirm your email subscription"}</h1>
    <p className="mt-4 text-slate-300">{action && token ? "Use the button below to finish. Opening this page alone doesn’t change your subscription." : "This subscription link is incomplete. Visit the posts page to request a new confirmation email."}</p>
    {action && token && <SubscriptionAction action={action} token={token} />}
    <Link href="/posts" className="mt-8 inline-block text-emerald-200">Back to posts →</Link>
  </main>;
}
