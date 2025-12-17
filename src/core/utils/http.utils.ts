/**
 * Creates an Error from a failed HTTP Response.
 *
 * @param action - A short description of the action that failed (e.g., "getPullRequest", "searchIssues")
 * @param response - The failed Response object
 * @returns A Promise that resolves to an Error with a descriptive message
 *
 * @example
 * if (!response.ok) {
 *   throw await makeError("getPullRequest", response);
 * }
 */
export const makeError = async (
  action: string,
  response: Response,
): Promise<Error> => {
  const text = await response.text();
  return new Error(
    `${action} failed: ${response.status} ${response.statusText} - ${text}`,
  );
};
