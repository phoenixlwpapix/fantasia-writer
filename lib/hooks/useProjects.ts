import useSWR, { mutate } from 'swr';
import { loadUserBooks } from '../supabase-db';
import { createClient } from '../supabase/client';
import { ProjectMetadata } from '../types';

// SWR cache key
export const PROJECTS_CACHE_KEY = 'user-projects';

const fetcher = async (): Promise<ProjectMetadata[]> => {
  const supabase = createClient();
  return loadUserBooks(supabase);
};

export function useProjects() {
  const { data, error, isLoading, mutate: boundMutate } = useSWR<ProjectMetadata[]>(
    PROJECTS_CACHE_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30秒内不重复请求
    }
  );

  return {
    projects: data ?? [],
    isLoading,
    error,
    mutate: boundMutate,
  };
}

// 全局刷新函数，可在任何地方调用
export function refreshProjects() {
  return mutate(PROJECTS_CACHE_KEY);
}

// 乐观更新：删除项目
export function optimisticDeleteProject(projectId: string) {
  return mutate<ProjectMetadata[]>(
    PROJECTS_CACHE_KEY,
    (current) => current?.filter((p) => p.id !== projectId),
    { revalidate: false }
  );
}

// 乐观更新：更新项目元数据
export function optimisticUpdateProject(projectId: string, data: Partial<ProjectMetadata>) {
  return mutate<ProjectMetadata[]>(
    PROJECTS_CACHE_KEY,
    (current) => current?.map((p) => (p.id === projectId ? { ...p, ...data } : p)),
    { revalidate: false }
  );
}
