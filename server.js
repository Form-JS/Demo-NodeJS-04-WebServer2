const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL, URLSearchParams } = require('url');
const ejs = require('ejs');

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
        sendServerResponse(res, 'contact/response');
    }
    else {
        sendServerResponse(res, 'error/404', 404);
    }
});



// Lancement du server
server.listen(7000, () => {
    console.log('Server up on port 7000');
});