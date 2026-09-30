"use client";

import Link from "next/link";
import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { BrandMark } from "@/components/BrandMark";
import { Mascot } from "@/components/Mascot";

const INCLUDED = [
  "Chapter 1: The Gray Village (always free)",
  "True Night and every chapter after it",
  "Every boss, route, and ending",
  "Cloud saves on any device",
];

type Order = {
  orderId?: string;
  amount?: number;
  orderName?: string;
  customerKey?: string;
  customerEmail?: string | null;
  error?: string;
};

export function ShopPanel({
  loggedIn,
  owned,
  krw,
  tossClientKey,
  cardPrice,
  status,
}: {
  loggedIn: boolean;
  owned: boolean;
  krw: number;
  tossClientKey: string | null;
  cardPrice: string | null;
  status: string | null;
}) {
  const [busy, setBusy] = useState<"toss" | "stripe" | null>(null);
  const [error, setError] = useState<string | null>(
    status && status !== "done" && status !== "pending" ? status : null,
  );
  const won = new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(krw);

  const payToss = async () => {
    if (!tossClientKey) return;
    setBusy("toss");
    setError(null);
    try {
      const response = await fetch("/api/pay/toss/order", { method: "POST" });
      const order = (await response.json()) as Order;
      if (!response.ok || !order.orderId || !order.customerKey || !order.amount) {
        throw new Error(order.error ?? "Could not create the order.");
      }
      const toss = await loadTossPayments(tossClientKey);
      const payment = toss.payment({ customerKey: order.customerKey });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: order.amount },
        orderId: order.orderId,
        orderName: order.orderName ?? "BlackSmile Full Game",
        customerEmail: order.customerEmail ?? undefined,
        successUrl: `${window.location.origin}/pay/toss/success`,
        failUrl: `${window.location.origin}/pay/toss/fail`,
        card: { useEscrow: false, flowMode: "DEFAULT", useCardPoint: false, useAppCardOnly: false },
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Payment could not start.";
      setError(/cancel/i.test(message) ? "Payment was canceled." : message);
      setBusy(null);
    }
  };

  const payStripe = async () => {
    setBusy("stripe");
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error(data.error ?? "Could not start checkout.");
      window.location.assign(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start checkout.");
      setBusy(null);
    }
  };

  return (
    <div className="shop-stage">
      <Link href="/" className="shop-back">
        Title
      </Link>

      <div className="shop-card">
        <Mascot size="lg" pose={owned || status === "done" ? "stand" : "sit"} bob className="mx-auto" />
        <p className="shop-brand">
          <BrandMark />
        </p>
        <h1 className="shop-title">Full Game</h1>
        <p className="shop-tag">One payment. Every chapter, forever.</p>

        <ul className="shop-list">
          {INCLUDED.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="shop-note">No random items. No subscriptions. No ads.</p>

        {status === "done" || owned ? (
          <div className="shop-owned" role="status">
            <p>{status === "done" ? "Payment complete. Thank you." : "You own the full game."}</p>
            <Link href="/play" className="story-choice">
              Continue the story
            </Link>
          </div>
        ) : !loggedIn ? (
          <div className="shop-actions">
            <p className="shop-price">{won}</p>
            <Link href="/login" className="story-choice">
              Log in to buy
            </Link>
            <p className="shop-fine">Purchases are tied to your account so saves and unlocks follow you.</p>
          </div>
        ) : (
          <div className="shop-actions">
            <p className="shop-price">{won}</p>
            <button
              type="button"
              className="story-choice"
              disabled={!tossClientKey || busy !== null}
              onClick={() => void payToss()}
            >
              {busy === "toss" ? "Opening Toss..." : `Pay ${won} · Toss`}
            </button>
            <p className="shop-fine">Korean cards, KakaoPay, NaverPay, TossPay</p>
            <button
              type="button"
              className="story-choice"
              disabled={!cardPrice || busy !== null}
              onClick={() => void payStripe()}
            >
              {busy === "stripe"
                ? "Opening checkout..."
                : cardPrice
                  ? `Pay ${cardPrice} · International card`
                  : "International card (coming soon)"}
            </button>
            <p className="shop-fine">Visa, Mastercard, Amex, Apple Pay, Google Pay via Stripe</p>
            {!tossClientKey ? <p className="shop-fine">Toss is not connected yet.</p> : null}
          </div>
        )}

        {status === "pending" ? (
          <p className="shop-status" role="status">
            Your payment is still being confirmed. Refresh in a moment.
          </p>
        ) : null}
        {error ? (
          <p className="shop-status is-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
