export async function httpClient<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('Content-Type') ?? '';

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!contentType.includes('application/json')) {
    const text = await response.text();

    throw new Error(
      `Expected JSON from ${url}, but received ${contentType || 'unknown content type'}. Response starts with: ${text.slice(0, 80)}`,
    );
  }

  return response.json() as Promise<T>;
}