import { queryOptions } from "@tanstack/react-query";
import { executeClickhouseQuery } from "@/lib/execute-query";
import { queryKeys } from "@/lib/query-keys";

export function clickhouseSqlRunQueryOptions(runId: number, sql: string) {
  return queryOptions({
    queryKey: queryKeys.clickhouse.sqlRun(runId, sql),
    queryFn: () => executeClickhouseQuery(sql),
  });
}
