"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppXcessDashboardOverview() {
    const router = useRouter();

    useEffect(() => {
        router.push("/appxcess/dashboard/branding");
    }, [router]);

    return null;
}
