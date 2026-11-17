import type { ReadonlyURLSearchParams } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

declare module "next/navigation" {
  export function useSearchParams(): ReadonlyURLSearchParams;
}
