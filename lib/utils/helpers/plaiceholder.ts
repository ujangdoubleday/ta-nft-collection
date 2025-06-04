'use server';

import { getPlaiceholder } from 'plaiceholder';
import sharp from 'sharp';

/**
 * Generate a base64 placeholder for a remote image URL
 * @param src Image URL
 * @returns Base64 encoded placeholder image
 */
export async function getImagePlaceholder(src: string): Promise<string> {
  try {
    // Fetch the image and convert to buffer
    const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()));

    // Generate the base64 placeholder
    const { base64 } = await getPlaiceholder(buffer);

    return base64;
  } catch (error) {
    console.error('Error generating placeholder:', error);
    // Return a default gray placeholder on error
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+t/+Cj3/AAU4/wCCcXwz/wCCZn7Wdx8Rf2vPgJ4Xt7P4G+N5p7q/+IWkwRRRjRrwl3Z7gBVABJJIAAJNfz//APBOv/g4T/4JVfAn9lnwb4S8a/tffDjT/E2j6Bb2GrWx1iMm2uEiVZYyPM4KuGU+xFfnl/wdaf8ABJn9o/8A4KVfFf8AZ/vvgT4A/wCEt0/wV4Z1ux8QXX9p2Vl9ku5ru2eOLdcSoHby4ZG2g5AdeQCQfwC/4iLP+CZv/Rbv/Mj6V/8AJFfxvxdwrxBDiDFxhgK0kqkkmoSaV5PZpH9qcB8a8Gz4TwEqmYYaLlRg21Vgm7wWt0z/2Q==';
  }
}

/**
 * Generate a simple color-based placeholder as base64 JPEG
 * This function can accept either:
 * 1. A string identifier to generate a consistent color
 * 2. Explicit width, height, and color parameters
 *
 * @param idOrWidth String identifier or width of the placeholder
 * @param heightOrColor Height of the placeholder or color (if first param is string)
 * @param color Background color (hex)
 * @returns Base64 encoded JPEG image
 */
export async function generateSimpleColorPlaceholder(
  idOrWidth: string | number = 10,
  heightOrColor: number | string = 10,
  color?: string,
): Promise<string> {
  try {
    let width = 10;
    let height = 10;
    let bgColor = '#cccccc';

    // Handle string identifier case
    if (typeof idOrWidth === 'string') {
      // Generate a simple hash from the string
      let hash = 0;
      for (let i = 0; i < idOrWidth.length; i++) {
        hash = (hash << 5) - hash + idOrWidth.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }

      // Generate a color from the hash
      const hue = Math.abs(hash % 360);
      const saturation = 70; // Fixed saturation
      const lightness = 60; // Fixed lightness

      bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      // If second param is a string, use it as color
      if (typeof heightOrColor === 'string') {
        bgColor = heightOrColor;
      }
    } else {
      // Handle numeric width/height case
      width = idOrWidth;
      height = heightOrColor as number;
      bgColor = color || bgColor;
    }

    // Create a simple colored image with sharp
    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: bgColor,
      },
    })
      .jpeg({
        quality: 30,
      })
      .toBuffer();

    // Convert to base64
    const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    return base64;
  } catch (error) {
    console.error('Error generating simple placeholder:', error);
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+t/+Cj3/AAU4/wCCcXwz/wCCZn7Wdx8Rf2vPgJ4Xt7P4G+N5p7q/+IWkwRRRjRrwl3Z7gBVABJJIAAJNfz//APBOv/g4T/4JVfAn9lnwb4S8a/tffDjT/E2j6Bb2GrWx1iMm2uEiVZYyPM4KuGU+xFfnl/wdaf8ABJn9o/8A4KVfFf8AZ/vvgT4A/wCEt0/wV4Z1ux8QXX9p2Vl9ku5ru2eOLdcSoHby4ZG2g5AdeQCQfwC/4iLP+CZv/Rbv/Mj6V/8AJFfxvxdwrxBDiDFxhgK0kqkkmoSaV5PZpH9qcB8a8Gz4TwEqmYYaLlRg21Vgm7wWt0z/2Q==';
  }
}

/**
 * Generate base64 placeholders for multiple images
 * @param urls Array of image URLs
 * @returns Array of base64 encoded placeholder images
 */
export async function getMultipleImagePlaceholders(urls: string[]): Promise<string[]> {
  try {
    const placeholders = await Promise.all(urls.map((url) => getImagePlaceholder(url)));
    return placeholders;
  } catch (error) {
    console.error('Error generating multiple placeholders:', error);
    return urls.map(
      () =>
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+t/+Cj3/AAU4/wCCcXwz/wCCZn7Wdx8Rf2vPgJ4Xt7P4G+N5p7q/+IWkwRRRjRrwl3Z7gBVABJJIAAJNfz//APBOv/g4T/4JVfAn9lnwb4S8a/tffDjT/E2j6Bb2GrWx1iMm2uEiVZYyPM4KuGU+xFfnl/wdaf8ABJn9o/8A4KVfFf8AZ/vvgT4A/wCEt0/wV4Z1ux8QXX9p2Vl9ku5ru2eOLdcSoHby4ZG2g5AdeQCQfwC/4iLP+CZv/Rbv/Mj6V/8AJFfxvxdwrxBDiDFxhgK0kqkkmoSaV5PZpH9qcB8a8Gz4TwEqmYYaLlRg21Vgm7wWt0z/2Q==',
    );
  }
}
