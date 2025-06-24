import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      },
    },
  },
});

export { queryClient };

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Ensure we're using the correct base URL for API calls
  const baseUrl = import.meta.env.DEV ? '' : '';  // In dev mode, proxy handles this
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  console.log('Making API request to:', fullUrl);
  
  const res = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Error:', res.status, errorText);
    throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};