const http = require('http');
const url = require('url');
const { URL, URLSearchParams } = require('url');

const sendServerResponse = (res, data, code = 200) => {
    res.writeHead(code, { "Content-Type": "text/plain" });
    res.write(data);
    res.end();
};

// Création du server
const server = http.createServer((req, res) => {

    // Extraction des informations de l'url
    const url = new URL(req.url, 'http://' + req.headers.host);
    console.log(url.pathname);

    // Systeme de routage (Simple !!!)
    // - Page d'accueil (→ Avec une Regex)
    if (/^\/(home\/?)?$/i.test(url.pathname)) {
        sendServerResponse(res, 'Home !');
    }
    // - About
    else if (url.pathname.toLowerCase() === '/about') {
        sendServerResponse(res, 'About !');
    }
    // - Contact
    else if (url.pathname.toLowerCase() === '/contact') {
        sendServerResponse(res, 'Formulaire de contact');
    }
    else {
        sendServerResponse(res, 'Page not found !', 404);
    }

});



// Lancement du server
server.listen(7000, () => {
    console.log('Server up on port 7000');
});