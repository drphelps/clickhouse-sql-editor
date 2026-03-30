import { queryKeys } from "@/lib/query-keys";

export const mutationKeys = {
  clickhouse: {
    uploadSql: [...queryKeys.clickhouse.all, "upload-sql"] as const,
  },
};
