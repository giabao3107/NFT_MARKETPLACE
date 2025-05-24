import { create as ipfsHttpClient } from 'ipfs-http-client';

// Infura IPFS configuration
const projectId = '8e7323d7fd6e47e6ba293c62820e4314';
const projectSecret = '/MFbVKbctu+iieyvrOO7zz8kKq2+uBnV0cii8T286ojpGw83Ik1CLw';

// Create base64 auth using browser-native btoa (more compatible than Buffer)
const auth = 'Basic ' + btoa(projectId + ':' + projectSecret);

// Create IPFS client
export const ipfsClient = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// Upload file to IPFS
export const uploadFileToIPFS = async (file) => {
  try {
    const added = await ipfsClient.add(file, {
      progress: (prog) => console.log(`File upload progress: ${prog}`)
    });
    
    const ipfsUrl = `https://ipfs.io/ipfs/${added.path}`;
    console.log('File uploaded to IPFS:', ipfsUrl);
    return ipfsUrl;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

// Upload JSON metadata to IPFS
export const uploadJSONToIPFS = async (jsonData) => {
  try {
    const jsonString = JSON.stringify(jsonData);
    const added = await ipfsClient.add(jsonString, {
      progress: (prog) => console.log(`Metadata upload progress: ${prog}`)
    });
    
    const ipfsUrl = `https://ipfs.io/ipfs/${added.path}`;
    console.log('Metadata uploaded to IPFS:', ipfsUrl);
    return ipfsUrl;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
};

// Fetch data from IPFS (browser-compatible version)
export const fetchFromIPFS = async (ipfsPath) => {
  try {
    // Extract hash from full IPFS URL if needed
    const hash = ipfsPath.replace('https://ipfs.io/ipfs/', '').replace('ipfs://', '');
    
    const chunks = [];
    for await (const chunk of ipfsClient.cat(hash)) {
      chunks.push(chunk);
    }
    
    // Convert Uint8Array to string without Buffer
    const decoder = new TextDecoder();
    const data = decoder.decode(new Uint8Array(chunks.flat()));
    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
};

export default ipfsClient; 