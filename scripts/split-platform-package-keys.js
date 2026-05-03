const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '..', 'text', 'packages');
const shopifyDir = path.join(__dirname, '..', 'text', 'packages-shopify');
const bigcommerceDir = path.join(__dirname, '..', 'text', 'packages-bigcommerce');

fs.mkdirSync(shopifyDir, {recursive: true});
fs.mkdirSync(bigcommerceDir, {recursive: true});

const localeFiles = fs.readdirSync(packagesDir).filter(f => f.endsWith('.json'));

for (const file of localeFiles) {
    const filePath = path.join(packagesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const shopifyKeys = {};
    const bigcommerceKeys = {};
    const remaining = {};

    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('SHOPIFY_')) {
            shopifyKeys[key] = value;
        } else if (key.startsWith('BIGCOMMERCE_')) {
            bigcommerceKeys[key] = value;
        } else {
            remaining[key] = value;
        }
    }

    if (Object.keys(shopifyKeys).length > 0) {
        fs.writeFileSync(path.join(shopifyDir, file), JSON.stringify(shopifyKeys, null, 4) + '\n');
    }

    if (Object.keys(bigcommerceKeys).length > 0) {
        fs.writeFileSync(path.join(bigcommerceDir, file), JSON.stringify(bigcommerceKeys, null, 4) + '\n');
    }

    fs.writeFileSync(filePath, JSON.stringify(remaining, null, 4) + '\n');

    const shopifyCount = Object.keys(shopifyKeys).length;
    const bcCount = Object.keys(bigcommerceKeys).length;
    if (shopifyCount > 0 || bcCount > 0) {
        console.log(file + ': moved ' + shopifyCount + ' Shopify + ' + bcCount + ' BigCommerce keys');
    }
}

console.log('Done.');
