#!/usr/bin/env node

/**
 * Google Ads OAuth Refresh Token Generator
 * 
 * This script helps you generate a refresh token for the Google Ads API.
 * Run this script once to get your refresh token, then add it to .env.local
 * 
 * Usage: node scripts/get-refresh-token.js
 */

const http = require('http');
const { URL } = require('url');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function getRefreshToken() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const question = (prompt) =>
        new Promise((resolve) => rl.question(prompt, resolve));

    try {
        log('\n=== Google Ads API - OAuth Refresh Token Generator ===\n', colors.bright);
        log('This script will help you generate a refresh token for the Google Ads API.\n');

        // Get credentials from user
        const clientId = await question('Enter your OAuth Client ID: ');
        const clientSecret = await question('Enter your OAuth Client Secret: ');

        if (!clientId || !clientSecret) {
            log('\n❌ Client ID and Client Secret are required!', colors.yellow);
            rl.close();
            return;
        }

        const redirectUri = 'http://localhost:3002/oauth2callback';
        const scope = 'https://www.googleapis.com/auth/adwords';

        // Build authorization URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scope);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        log('\n📋 Step 1: Authorize the application', colors.cyan);
        log('Open this URL in your browser:\n', colors.blue);
        log(authUrl.toString(), colors.bright);
        log('\n');

        // Start local server to receive the callback
        let authCode = '';
        const server = http.createServer(async (req, res) => {
            const reqUrl = new URL(req.url, `http://${req.headers.host}`);

            if (reqUrl.pathname === '/oauth2callback') {
                authCode = reqUrl.searchParams.get('code');

                if (authCode) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #4CAF50;">✅ Authorization Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);
                    server.close();
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #f44336;">❌ Authorization Failed</h1>
                <p>No authorization code received. Please try again.</p>
              </body>
            </html>
          `);
                    server.close();
                }
            }
        });

        server.listen(3002, () => {
            log('🌐 Local server started on http://localhost:3002', colors.green);
            log('Waiting for authorization...\n');
        });

        // Wait for the authorization code
        await new Promise((resolve) => {
            server.on('close', resolve);
        });

        if (!authCode) {
            log('❌ Failed to receive authorization code', colors.yellow);
            rl.close();
            return;
        }

        log('\n📋 Step 2: Exchanging authorization code for tokens...', colors.cyan);

        // Exchange authorization code for tokens
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const tokenParams = new URLSearchParams({
            code: authCode,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: tokenParams.toString(),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            log(`\n❌ Failed to exchange code for tokens: ${errorText}`, colors.yellow);
            rl.close();
            return;
        }

        const tokens = await tokenResponse.json();

        // Display the tokens
        log('\n✅ Success! Here are your tokens:\n', colors.green);
        log('='.repeat(80), colors.bright);
        log('\nAccess Token (expires in 1 hour):', colors.cyan);
        log(tokens.access_token, colors.bright);
        log('\nRefresh Token (use this in .env.local):', colors.cyan);
        log(tokens.refresh_token, colors.bright);
        log('\n' + '='.repeat(80), colors.bright);

        log('\n📝 Next Steps:', colors.yellow);
        log('1. Copy the Refresh Token above');
        log('2. Add it to your .env.local file as GOOGLE_ADS_REFRESH_TOKEN');
        log('3. Make sure all other environment variables are set');
        log('4. Start your Next.js application with: npm run dev\n');

    } catch (error) {
        log(`\n❌ Error: ${error.message}`, colors.yellow);
    } finally {
        rl.close();
    }
}

// Run the script
getRefreshToken();
