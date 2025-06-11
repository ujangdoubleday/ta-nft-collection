import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { contractName } = data;

    if (!contractName) {
      return NextResponse.json({ error: 'Contract name is required' }, { status: 400 });
    }

    // Path to the contract source
    const contractPath = path.join(process.cwd(), `contracts/${contractName}.sol`);

    // Check if contract exists
    if (!fs.existsSync(contractPath)) {
      return NextResponse.json({ error: `Contract ${contractName} not found` }, { status: 404 });
    }

    // Read the contract source
    const sourceCode = fs.readFileSync(contractPath, 'utf8');

    // If it's NFTFactory, we need to handle imports
    if (contractName === 'NFTFactory') {
      // Get the NFTCollection source
      const collectionPath = path.join(process.cwd(), 'contracts/NFTCollection.sol');
      const collectionSource = fs.readFileSync(collectionPath, 'utf8');

      // Handle import resolution by replacing the import statement with the actual content
      const processedSource = sourceCode.replace(
        /import ['"]\.\/NFTCollection\.sol['"];/,
        collectionSource.replace('// SPDX-License-Identifier: MIT', '').trim(),
      );

      return NextResponse.json({ sourceCode: processedSource });
    }

    // For Combined.sol, return as is
    if (contractName === 'Combined') {
      return NextResponse.json({ sourceCode });
    }

    // For NFTCollection, check if it imports Counters and handle it
    if (contractName === 'NFTCollection') {
      // Check if it imports from utils/Counters.sol
      if (sourceCode.includes("import './utils/Counters.sol';")) {
        const countersPath = path.join(process.cwd(), 'contracts/utils/Counters.sol');
        if (fs.existsSync(countersPath)) {
          const countersSource = fs.readFileSync(countersPath, 'utf8');
          // Replace the import with the actual Counters.sol content
          const processedSource = sourceCode.replace(
            /import ['"]\.\/utils\/Counters\.sol['"];/,
            countersSource.replace('// SPDX-License-Identifier: MIT', '').trim(),
          );
          return NextResponse.json({ sourceCode: processedSource });
        }
      }
      return NextResponse.json({ sourceCode });
    }

    return NextResponse.json({ sourceCode });
  } catch (error) {
    console.error('Error reading contract source:', error);
    return NextResponse.json({ error: 'Failed to read contract source code' }, { status: 500 });
  }
}
