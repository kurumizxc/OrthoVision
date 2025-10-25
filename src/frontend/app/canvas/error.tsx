"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Editor failed to load</h1>
        <p className="text-gray-600">
          We cleared your previous state. Please go back and upload a new image to try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()}>Retry</Button>
          <a href="/" className="text-blue-600 hover:underline">Go home</a>
        </div>
      </div>
    </div>
  );
}
