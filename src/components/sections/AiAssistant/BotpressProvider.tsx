"use client";

import Script from "next/script";

const INJECT = process.env.NEXT_PUBLIC_BOTPRESS_INJECT_URL!;
const BUNDLE = process.env.NEXT_PUBLIC_BOTPRESS_BUNDLE_URL!;

export default function BotpressProvider() {
  return (
    <>
      <Script src={INJECT} strategy="afterInteractive" />
      <Script src={BUNDLE} strategy="afterInteractive" />
    </>
  );
}
