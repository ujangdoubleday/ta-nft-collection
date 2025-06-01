import pinataSDK from '@pinata/sdk';
import FormData from 'form-data';
import axios from 'axios';
import { Readable } from 'stream';

// Initialize Pinata client
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
const pinataJWT = process.env.PINATA_JWT;
const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud';

// Check if credentials are available
if (!pinataApiKey || !pinataSecretApiKey) {
  console.warn('Pinata API keys not found in environment variables');
}

// Create Pinata client if credentials are available
export const pinata =
  pinataApiKey && pinataSecretApiKey ? new pinataSDK(pinataApiKey, pinataSecretApiKey) : null;

/**
 * Create a new folder (group) in Pinata using v3 API
 * @param name Name for the folder
 * @returns Folder ID and name
 */
export async function createPinataFolder(name: string) {
  try {
    // JWT token is required for v3 API
    if (!pinataJWT) {
      throw new Error('Pinata JWT token not found. V3 API requires JWT authentication.');
    }

    try {
      console.log(`Creating Pinata group: ${name}`);

      // Set headers for v3 API
      const headers = {
        Authorization: `Bearer ${pinataJWT}`,
        'Content-Type': 'application/json',
      };

      // Create group using v3 API
      const response = await axios.post(
        'https://api.pinata.cloud/v3/groups/public',
        {
          name: name,
          is_public: true,
        },
        { headers },
      );

      console.log('Pinata group created:', response.data);

      // In v3 API, the response has a 'data' property containing the group information
      if (response.data && response.data.data && response.data.data.id) {
        return {
          id: response.data.data.id,
          name: name,
        };
      } else {
        console.error('Unexpected response format from Pinata:', response.data);
        throw new Error('Group ID not found in Pinata response');
      }
    } catch (apiError: any) {
      console.error('Pinata API error details:', apiError.response?.data || apiError.message);

      // If API error occurs, return a dummy folder
      if (apiError.response) {
        console.warn(
          `Pinata group API error (${apiError.response.status}). Using metadata keyvalues instead.`,
        );

        // Use timestamp as dummy folder ID
        const dummyId = `folder_${Date.now()}`;

        return {
          id: dummyId,
          name: name,
          isDummy: true,
        };
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error creating Pinata group:', error);
    throw new Error(
      `Failed to create Pinata group: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get list of folders from Pinata using v3 API
 * @returns Array of folders
 */
export async function getPinataFolders() {
  try {
    // JWT token is required for v3 API
    if (!pinataJWT) {
      throw new Error('Pinata JWT token not found. V3 API requires JWT authentication.');
    }

    // Set headers for v3 API
    const headers = {
      Authorization: `Bearer ${pinataJWT}`,
    };

    try {
      // Get folders using v3 API
      const response = await axios.get('https://api.pinata.cloud/v3/groups/public', { headers });

      console.log('Pinata groups fetched:', response.data);

      // Format response according to application expectations
      if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
        return response.data.data.items.map((group: any) => ({
          id: group.id || group.group_id,
          name: group.name,
        }));
      } else if (response.data && Array.isArray(response.data.items)) {
        return response.data.items.map((group: any) => ({
          id: group.id || group.group_id,
          name: group.name,
        }));
      }

      return [];
    } catch (apiError: any) {
      console.error('Pinata API error details:', apiError.response?.data || apiError.message);

      // Return empty array on API error
      console.warn(
        `Pinata folder API error (${apiError.response?.status}). Returning empty folder list.`,
      );
      return [];
    }
  } catch (error) {
    console.error('Error getting Pinata folders:', error);
    throw new Error(
      `Failed to get Pinata folders: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Upload file to Pinata IPFS
 * @param fileBuffer File buffer to upload
 * @param fileName Name for the file
 * @param folderId Optional folder/group ID to upload to
 * @returns CID and URL of the uploaded file
 */
export async function uploadFileToPinata(fileBuffer: Buffer, fileName: string, folderId?: string) {
  try {
    if (!pinataApiKey && !pinataSecretApiKey && !pinataJWT) {
      throw new Error('Pinata credentials not found. Check your API keys or JWT.');
    }

    // Use v3 API if JWT and folderId are available
    if (pinataJWT && folderId && !folderId.startsWith('folder_')) {
      try {
        console.log(`Attempting to upload to Pinata group: ${folderId}`);

        // Create FormData for v3 API
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename: fileName });
        formData.append('network', 'public');
        formData.append('name', fileName);
        formData.append('group_id', folderId);
        formData.append('keyvalues', JSON.stringify({}));

        // Upload using v3 API
        const response = await axios.post('https://uploads.pinata.cloud/v3/files', formData, {
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
            'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          },
          maxBodyLength: Infinity,
        });

        console.log('File uploaded to Pinata group successfully:', response.data);

        // Format response - handle both v3 and v2 response formats
        let ipfsHash;
        if (response.data && response.data.data) {
          // v3 API response
          ipfsHash =
            response.data.data.cid ||
            response.data.data.ipfs_pin_hash ||
            response.data.data.IpfsHash;
        } else {
          // v2 API response
          ipfsHash = response.data.ipfs_pin_hash || response.data.IpfsHash || response.data.cid;
        }

        if (!ipfsHash) {
          console.error('CID not found in Pinata response:', response.data);
          throw new Error('CID not found in Pinata response');
        }

        return {
          cid: ipfsHash,
          url: `${gatewayUrl}/ipfs/${ipfsHash}`,
        };
      } catch (v3Error: any) {
        console.error(
          'Error uploading to Pinata group:',
          v3Error.response?.data || v3Error.message,
        );
        console.error('Falling back to regular upload');
        // Continue to v2 API if v3 fails
      }
    }

    // Use v2 API as fallback
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: fileName });

    // Add pinata metadata
    const metadata: any = {
      name: fileName,
    };

    // Add folder ID if provided (for v2 API compatibility)
    if (folderId && !folderId.startsWith('folder_')) {
      metadata.keyvalues = {
        folder: folderId,
      };
    }

    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Set headers based on available credentials
    const headers: Record<string, string> = {};

    if (pinataJWT) {
      headers['Authorization'] = `Bearer ${pinataJWT}`;
    } else {
      headers['pinata_api_key'] = pinataApiKey!;
      headers['pinata_secret_api_key'] = pinataSecretApiKey!;
    }

    // Use standard v2 API
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        ...headers,
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      },
      maxBodyLength: Infinity,
    });

    // Format response
    const ipfsHash = response.data.IpfsHash || response.data.cid || response.data.ipfs_pin_hash;

    if (!ipfsHash) {
      console.error('CID not found in Pinata response:', response.data);
      throw new Error('CID not found in Pinata response');
    }

    return {
      cid: ipfsHash,
      url: `${gatewayUrl}/ipfs/${ipfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error(
      `Failed to upload to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Upload JSON metadata to Pinata IPFS
 * @param metadata JSON metadata to upload
 * @param name Name for the metadata file
 * @param folderId Optional folder/group ID to upload to
 * @returns CID and URL of the uploaded metadata
 */
export async function uploadMetadataToPinata(metadata: any, name: string, folderId?: string) {
  try {
    if (!pinataApiKey && !pinataSecretApiKey && !pinataJWT) {
      throw new Error('Pinata credentials not found. Check your API keys or JWT.');
    }

    // Use v3 API if JWT and folderId are available
    if (pinataJWT && folderId && !folderId.startsWith('folder_')) {
      try {
        console.log(`Attempting to upload metadata to Pinata group: ${folderId}`);

        // For v3 API JSON upload with group, we need to use FormData
        const formData = new FormData();

        // Convert metadata to JSON string and add as file
        const metadataBlob = new Blob([JSON.stringify(metadata)], {
          type: 'application/json',
        });

        // Add metadata as file
        formData.append('file', metadataBlob, `${name}.json`);
        formData.append('network', 'public');
        formData.append('name', `${name}.json`);
        formData.append('group_id', folderId);
        formData.append('keyvalues', JSON.stringify({}));

        // Upload using v3 API
        const response = await axios.post('https://uploads.pinata.cloud/v3/files', formData, {
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
            'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          },
        });

        console.log('Metadata uploaded to Pinata group successfully:', response.data);

        // Format response - handle both v3 and v2 response formats
        let ipfsHash;
        if (response.data && response.data.data) {
          // v3 API response
          ipfsHash =
            response.data.data.cid ||
            response.data.data.ipfs_pin_hash ||
            response.data.data.IpfsHash;
        } else {
          // v2 API response
          ipfsHash = response.data.ipfs_pin_hash || response.data.IpfsHash || response.data.cid;
        }

        if (!ipfsHash) {
          console.error('CID not found in Pinata response:', response.data);
          throw new Error('CID not found in Pinata response');
        }

        return {
          cid: ipfsHash,
          url: `${gatewayUrl}/ipfs/${ipfsHash}`,
        };
      } catch (v3Error: any) {
        console.error(
          'Error uploading metadata to Pinata group:',
          v3Error.response?.data || v3Error.message,
        );
        console.error('Falling back to regular upload');
        // Continue to v2 API if v3 fails
      }
    }

    // Use v2 API as fallback
    const pinataMetadata: any = {
      name,
    };

    // Add folder ID if provided (for v2 API compatibility)
    if (folderId && !folderId.startsWith('folder_')) {
      pinataMetadata.keyvalues = {
        folder: folderId,
      };
    }

    const data = {
      pinataMetadata,
      pinataContent: metadata,
    };

    // Set headers based on available credentials
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (pinataJWT) {
      headers['Authorization'] = `Bearer ${pinataJWT}`;
    } else {
      headers['pinata_api_key'] = pinataApiKey!;
      headers['pinata_secret_api_key'] = pinataSecretApiKey!;
    }

    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
      headers,
    });

    // Format response
    const ipfsHash = response.data.IpfsHash || response.data.cid || response.data.ipfs_pin_hash;

    if (!ipfsHash) {
      console.error('CID not found in Pinata response:', response.data);
      throw new Error('CID not found in Pinata response');
    }

    return {
      cid: ipfsHash,
      url: `${gatewayUrl}/ipfs/${ipfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw new Error(
      `Failed to upload metadata to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
