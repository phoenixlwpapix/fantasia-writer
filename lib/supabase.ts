import { createBrowserClient, parseCookieHeader } from "@supabase/ssr";
import { headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const createServerComponentClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // @ts-ignore
          const cookieHeader = headers().get("cookie");
          if (!cookieHeader) return [];
          return parseCookieHeader(cookieHeader).map(({ name, value }) => ({
            name,
            value: value || "",
          }));
        },
        setAll: () => {
          // Server components are read-only
        },
      },
    }
  );
