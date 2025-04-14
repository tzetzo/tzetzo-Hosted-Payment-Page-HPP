import { useQuery } from "@tanstack/react-query";
import axios, { Method } from "axios";

export const useRequest = (
  uuid: string | undefined,
  method: Method,
  path: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["request", uuid, path],
    queryFn: async () => {
      const response = await axios({
        method,
        url: `https://api.sandbox.bvnk.com/api/v1/pay/${uuid}/${path}`,
      });
      return response.data;
    },
    enabled: !!uuid && enabled, // Only fetch if uuid is available and enabled is true
  });
};
