import { mutationOptions } from "@tanstack/react-query";
import { executeClickhouseQueryFromUpload } from "@/lib/execute-query";
import { mutationKeys } from "@/lib/mutation-keys";

export interface ClickhouseSqlUploadVariables {
  file: File;
  normalizedScript: string;
}

export const clickhouseSqlUploadMutation = mutationOptions({
  mutationKey: mutationKeys.clickhouse.uploadSql,
  mutationFn: ({ file }: ClickhouseSqlUploadVariables) =>
    executeClickhouseQueryFromUpload(file),
  retry: false,
});
