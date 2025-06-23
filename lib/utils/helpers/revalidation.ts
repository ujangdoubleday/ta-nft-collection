'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Server action to revalidate a specific path
 * @param path The path to revalidate
 * @returns Object indicating success or failure
 */
export async function revalidatePathAction(path: string) {
  try {
    revalidatePath(path);
    return { success: true, message: `Path ${path} revalidated` };
  } catch (error) {
    console.error('Error revalidating path:', error);
    return { success: false, message: `Failed to revalidate ${path}`, error };
  }
}

/**
 * Server action to revalidate a specific cache tag
 * @param tag The cache tag to revalidate
 * @returns Object indicating success or failure
 */
export async function revalidateTagAction(tag: string) {
  try {
    revalidateTag(tag);
    return { success: true, message: `Tag ${tag} revalidated` };
  } catch (error) {
    console.error('Error revalidating tag:', error);
    return { success: false, message: `Failed to revalidate tag ${tag}`, error };
  }
}
