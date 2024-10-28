const fs = require('fs');
const readline = require('readline');
const balance = require('crypto-balances-2');
const { Connection, PublicKey } = require('@solana/web3.js');

async function isValidSolanaAddress(address) {
    try {
        new PublicKey(address);
        return true;
    } catch (error) {
        return false;
    }
}

async function getSolanaBalance(address) {
    const connection = new Connection('https://api.mainnet-beta.solana.com');

    // Get the balance
    const balance = await connection.getBalance(new PublicKey(address));
    return balance / 1000000000; // Balance is returned in lamports
}

async function isEthereumPubKey(pubKey) {
    const pubKeyPattern = /^0x[a-fA-F0-9]{40}$/;
    return pubKeyPattern.test(pubKey);
}

async function processFile(inputFile, outputFile) {
    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const output = fs.createWriteStream(outputFile);

    for await (const line of rl) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (line.startsWith('#') || line.trim().length === 0) {
            console.log(`${line}`);
            continue;
        }

        if (await isValidSolanaAddress(line)) {
            sol = await getSolanaBalance(line);
            if (sol == 0) {
                console.log(`${line}: No SOL!`);
                continue;
            }
            ret = { address_type: 'SOL', balances: sol }
            
            console.log(`https://solscan.io/account/${line}\t${sol}`, '⭐'.repeat(sol/20));
        } else {
            ret = await balance(line);
            if (ret["balances"] == undefined || Object.keys(ret["balances"]).length == 0) {
                if (ret["error"] != undefined)
                    console.log(`${line}: `, ret);
                else
                    console.log(`${line}: None`);
                continue;
            }
            console.log(`https://debank.com/profile/${line}`, ret, `✨`.repeat(ret['balances']['ETH']));
        }
       
        output.write(`${line}: ${JSON.stringify(ret)}\n`);
    }

    output.end();
}

processFile('input.txt', 'output.txt');