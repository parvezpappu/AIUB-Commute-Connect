"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "./api";

export function useRequireAuth() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        await getCurrentUser();

        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return isCheckingAuth;
}

export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        await getCurrentUser();
        router.replace("/dashboard");
      } catch {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return isCheckingAuth;
}

export function useRequireAdmin() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const user = await getCurrentUser();

        if (user.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return isCheckingAuth;
}

export function useRequireStudent() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const user = await getCurrentUser();

        if (user.role !== "STUDENT") {
          router.replace("/dashboard");
          return;
        }

        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return isCheckingAuth;
}
