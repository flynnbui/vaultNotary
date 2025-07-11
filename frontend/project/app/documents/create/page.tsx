"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateDocumentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to manage page with create mode
    router.replace("/documents/manage?mode=create");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}