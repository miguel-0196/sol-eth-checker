// check sol balance and eth tokens

const fs = require('fs');
const readline = require('readline');
const balance = require('crypto-balances-2');
const { Connection, PublicKey } = require('@solana/web3.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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

async function processFile(inputFile, outputFile) {
    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const output = fs.createWriteStream(outputFile);

    for await (const line of rl) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (line.startsWith('#') || line.trim().length === 0)
            continue;

        if (await isValidSolanaAddress(line)) {
            sol = await getSolanaBalance(line);
            if (sol == 0)
                continue;
        
            ret = { address_type: 'SOL', balances: sol }
            console.log(`https://solscan.io/account/${line}\t${sol} SOL`, '⭐'.repeat(sol/20));
        } else {
            await sleep(3000);
            ret = await balance(line);
            if (ret["balances"] == undefined || Object.keys(ret["balances"]).length == 0) {
                if (ret["error"] != undefined)
                    console.log(`${line}: ${JSON.stringify(ret)}`);
                continue;
            }
            console.log(`https://debank.com/profile/${line}\t`, JSON.stringify(ret), `✨`.repeat(ret['balances']['ETH']));
        }
       
        output.write(`${line}: ${JSON.stringify(ret)}\n`);
    }

    output.end();
}

processFile('input.txt', 'output.txt');