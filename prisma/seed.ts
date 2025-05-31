import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.nFT.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  const user = await prisma.user.create({
    data: {
      address: '0x1234567890123456789012345678901234567890',
    },
  });

  console.log('Created test user:', user);

  // Create a test collection
  const collection = await prisma.collection.create({
    data: {
      name: 'Sample Collection',
      description: 'A sample NFT collection for testing',
      contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      contractURI: 'https://picsum.photos/id/1/500/500/metadata.json',
      ownerAddress: user.address,
    },
  });

  console.log('Created test collection:', collection);

  // Create a second collection with a different owner
  const collection2 = await prisma.collection.create({
    data: {
      name: 'Pixel Art Collection',
      description: 'A collection of pixel art NFTs',
      contractAddress: '0x9876543210987654321098765432109876543210',
      contractURI: 'https://picsum.photos/id/10/500/500/metadata.json',
      ownerAddress: user.address,
    },
  });

  console.log('Created second test collection:', collection2);

  // Create a test NFT
  const nft = await prisma.nFT.create({
    data: {
      tokenId: '1',
      name: 'Sample NFT',
      description: 'A sample NFT for testing',
      imageUrl: 'https://picsum.photos/id/2/500/500',
      contractAddress: collection.contractAddress,
      ownerAddress: user.address,
      price: 0.1,
      listed: true,
    },
  });

  console.log('Created test NFT:', nft);

  // Create a second test NFT
  const nft2 = await prisma.nFT.create({
    data: {
      tokenId: '1',
      name: 'Pixel Art NFT',
      description: 'A pixel art NFT for testing',
      imageUrl: 'https://picsum.photos/id/3/500/500',
      contractAddress: collection2.contractAddress,
      ownerAddress: user.address,
      price: 0.05,
      listed: true,
    },
  });

  console.log('Created second test NFT:', nft2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
