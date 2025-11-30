import { createBrowserClient } from "@supabase/ssr";

// 定义单例变量，防止客户端重复创建实例
let client: ReturnType<typeof createBrowserClient> | undefined;

export const createClient = () => {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
};
