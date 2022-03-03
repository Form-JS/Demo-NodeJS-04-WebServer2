const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL, URLSearchParams } = require('url');
const ejs = require('ejs');
const querystring = require('query-string');

// Liste de produit (Hardcodé / Cas pratique => Utilisation d'une DB!)
const products = [
    { id: 1, name: 'T-Shirt', desc: 'T-Shirt My little Poney', price: 20 },
    { id: 2, name: 'Pull', desc: 'Pull noir', price: 34.99 },
    { id: 3, name: 'Robe', desc: 'Robe classique', price: 42 },
    { id: 4, name: 'Robe longue', desc: 'Robe bleu ou dorée ?', price: 74.95 },
    { id: 5, name: 'Jean', desc: 'Bah... C\'est un jean.', price: 24.5 },
    { id: 6, name: 'Pantalon', desc: 'Super pantalon rose bonbon', price: 10.01 },
    { id: 7, name: 'Short', desc: 'Petit short bob l\'eponge', price: 99.95 },
];
// Exercice => Créer 2 pages
//  "product"   : Affiche une page la liste des produits (Nom + prix)
//  "product/15" : Affiche une page avec le detail du produit


const sendServerResponse = (res, pageName, data = {}, code = 200) => {
    // Récuperation du fichier "view" de la page demandé
    const file = path.resolve(__dirname, 'views', 'pages', pageName + '.ejs');

    // Utilisation du moteur de template 'EJS'    
    ejs.renderFile(file, data, function (error, pageRender) {
        if (error) {
            console.log(error);
            res.writeHead(500);
            res.end();
            return;
        }

        // Réponse du server
        res.writeHead(code, { "Content-Type": "text/html" });
        res.write(pageRender);
        res.end();
    });
};

const publicFileExists = (targetFile) => {
    const filename = path.resolve(__dirname, 'public' + targetFile);

    if (fs.existsSync(filename)) {
        return fs.statSync(filename).isFile();
    }
    return false;
};

const sendFile = (res, targetFile) => {
    const filename = path.resolve(__dirname, 'public' + targetFile);

    fs.readFile(filename, (error, data) => {
        res.writeHead(200);
        res.end(data, 'utf-8');
    });
};

const getBodyData = (req) => {
    // On s'assure que la requete est un 'POST' -> Sinon aucunne donnée
    if (req.method !== 'POST') {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        // Event DATA: Permet de lire les données de la requete POST
        let body = '';
        req.on('data', (postData) => {
            // console.log(postData);
            body += postData.toString('utf-8');
        });

        // Event END: Se déclanche quand toutes les données ont été traité 
        req.on('end', () => {
            console.log(body);
            // body => name=Olivier&email=oli%40caramail.com&message=Test
            // Réponse de type "application/x-www-form-urlencoded" pour les formulaires
            const result = querystring.parse(body);

            resolve(result);
        });
    });
};

// Création du server
const server = http.createServer((req, res) => {
    // Extraction des informations de l'url
    const url = new URL(req.url, 'http://' + req.headers.host);
    console.log(url.pathname);

    // Systeme de routage (Simple !!!)
    // - Fichier public!
    if (publicFileExists(url.pathname)) {
        sendFile(res, url.pathname);
    }
    // - Page d'accueil (→ Avec une Regex)
    else if (req.method === 'GET' && /^\/(home\/?)?$/i.test(url.pathname)) {
        const now = new Date();
        const today = now.toLocaleDateString('fr-be');
        sendServerResponse(res, 'home/index', { today });
    }
    // - About
    else if (req.method === 'GET' && url.pathname.toLowerCase() === '/about') {
        sendServerResponse(res, 'home/about');
    }
    // - Contact
    else if (req.method === 'GET' && url.pathname.toLowerCase() === '/contact') {
        sendServerResponse(res, 'contact/index');
    }
    else if (req.method === 'POST' && url.pathname.toLowerCase() === '/contact') {
        getBodyData(req).then((data) => {
            sendServerResponse(res, 'contact/response', { name: data.name });
        });
    }
    else if (req.method === 'GET' && url.pathname.toLowerCase() === '/product') {

        sendServerResponse(res, 'product/index', {
            nbProducts: products.length,
            products
        });
    }
    else {
        sendServerResponse(res, 'error/404', 404);
    }
});


// Lancement du server
server.listen(7000, () => {
    console.log('Server up on port 7000');
});