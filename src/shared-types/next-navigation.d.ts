import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ReadonlyURLSearchParams } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import type { Params } from "next/dist/server/request/params";

declare module "next/navigation" {
  export * from "next/dist/client/components/navigation";
  export function usePathname(): string;
  export function useRouter(): AppRouterInstance;
  export function useSearchParams(): ReadonlyURLSearchParams;
  export function useParams<T extends Params = Params>(): T;
  export function useSelectedLayoutSegments(parallelRouteKey?: string): string[];
  export function useSelectedLayoutSegment(parallelRouteKey?: string): string | null;
}
