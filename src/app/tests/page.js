"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";

export default function TestsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <LoadingState label="Opening test library" />;
}