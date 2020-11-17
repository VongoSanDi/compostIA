const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const https = require('https')
const mysql = require('mysql')
const path = require('path');


const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
    PORT = process.env.PORT || 4000,
    SESS_LIFETIME = TWO_HOURS,
    SESS_NAME = 'sid',
    SESS_SECRET = '[09D5/ojIQlP)6y'
} = process.env

const app = express()

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(__dirname + '../compostia/public'));

app.set('trust proxy', true)

/*************  GET  **************/

app.get('/', (req,res) => {
    //console.log(path.join(__dirname, '../compostia/public/index.html'));
    res.sendFile(path.join(__dirname, '../compostia/public/index.html'));
})

app.get('/help',  (req,res) => {
    res.send(`
    <h3>Liste des url valides :</h3> 
    <a href='/liste_adresses?page=1&itemPerPage=20'>get/liste_adresses</a> <pre>récupérer la liste de toutes les adresses (+nom) avec pagination</pre><br>
    <a href='/geo_json_all'>get/geo_json_all</a><pre>récupérer un tableau avec toutes les coordonnées (x,y) de tous les composteurs de "Quartiers"</pre><br>
    <form action='/geo_json_by_name' method='post'>post/geo_json_by_name : <input type="text" name="nom" placeholder="nom" value="Jardin des Emmeraudes"><input type="submit" value="ok"> <pre>récupérer les coordonnées d'un composteur, en foncction de son nom</pre></form>
    `)
    
})

app.get('/liste_adresses', async (req,res) => {
    const { page='1', itemPerPage='20' } = req.query;
    const iPage = parseInt(page,10);
    const iItemPerPage = parseInt(itemPerPage,10);
    const itemStart = ((iPage-1) * iItemPerPage) + 1;
    var options = {
        host: 'download.data.grandlyon.com',
        path: `/ws/grandlyon/gip_proprete.gipcomposteur_latest/all.json?maxfeatures=${iItemPerPage}&start=${itemStart}`
    };
    const data = JSON.parse(await getFromGrandLyonAPI(options));
    res.send(data)
})

app.post('/geo_json_by_name', async (req,res) => {
    const { nom } = req.body;
    console.log(nom,encodeURI(nom));
    if(nom != ''){
        var options = {
            host: 'download.data.grandlyon.com',
            path: `/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=gip_proprete.gipcomposteur_latest&outputFormat=application/json;%20subtype=geojson&SRSNAME=EPSG:4171&filter=Filter=%3CFilter%3E%20%3CPropertyIsLike%20wildcard=%22*%22%20singleChar=%27.%27%20escape=%27_%27%3E%20%3CPropertyName%3Enom%3C/PropertyName%3E%3CLiteral%3E${encodeURI(nom)}%3C/Literal%3E%3C/PropertyIsLike%3E%20%3C/Filter%3E`
        };
        const data = JSON.parse(await getFromGrandLyonAPI(options));
        res.send(data.features[0].geometry)
    }
})

app.get('/geo_json_all', async (req,res) => {
    var options = {
        host: 'download.data.grandlyon.com',
        path: `/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=gip_proprete.gipcomposteur_latest&outputFormat=application/json;%20subtype=geojson&SRSNAME=EPSG:4171&filter=Filter=%3CFilter%3E%20%3CPropertyIsLike%20wildcard=%22*%22%20singleChar=%27.%27%20escape=%27_%27%3E%20%3CPropertyName%3Etypesite%3C/PropertyName%3E%3CLiteral%3EQuartier%3C/Literal%3E%3C/PropertyIsLike%3E%20%3C/Filter%3E`
    };
    const data = JSON.parse(await getFromGrandLyonAPI(options));
    var tabRes = [];
    data.features.forEach(element => {
        tabRes.push(element.geometry.coordinates)
    })
    res.send(tabRes)
})


/********  SIGN UP  *********/

app.post('/signup', (req, res) =>{
    const { profil, codeMairie, arrondissement, nom, prenom, email, password, sexe } = req.body
    if((username == correctUser.name) && (password == correctUser.password)){
        return true;
    }else{
        return false;
    }
})

/********  SIGN IN  *********/

app.post('/signin', (req, res) =>{
    const { username, password } = req.body
    if((username == correctUser.name) && (password == correctUser.password)){
        return true;
    }else{
        return false;
    }
})



// https://download.data.grandlyon.com/ws/grandlyon/gip_proprete.gipcomposteur_latest/all.json
// geolocalisation json
// https://download.data.grandlyon.com/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=gip_proprete.gipcomposteur_latest&outputFormat=application/json;%20subtype=geojson&SRSNAME=EPSG:4171&filter=Filter=%3CFilter%3E%20%3CPropertyIsLike%20wildcard=%22*%22%20singleChar=%27.%27%20escape=%27_%27%3E%20%3CPropertyName%3Enom%3C/PropertyName%3E%3CLiteral%3EJardin%20des%20Emmeraudes%3C/Literal%3E%3C/PropertyIsLike%3E%20%3C/Filter%3E


app.listen(PORT, function () {
    console.log(`En écoute sur le port ${PORT}:`);
});


function getFromGrandLyonAPI(options){
    return new Promise(resolve =>{
        https.get(options, function (https_res) {
            var data;
            https_res.on("data", function (chunk) {
                if(!data){
                    data = chunk;
                }else{
                    data += chunk;
                }
            });
            https_res.on("end", function () {
                resolve(data.toString('utf-8'));
            });
        });
    })
}

/*
function createConnection(){
    return new Sequelize('breqsvuxjx8beci0', 'a828s15r67nr68up', 'axkf094sdt59jgn8', {
        host: "sabaik6fx8he7pua.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
        dialect: 'mysql'
    })
}

async function tryConnect(sequelize){
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
}
*/