const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const https = require('https')
const mysql = require('mysql')
const path = require('path');

var cors = require('cors')


const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
    PORT = process.env.PORT || 4000,
    SESS_LIFETIME = TWO_HOURS,
    SESS_NAME = 'sid',
    SESS_SECRET = '[09D5/ojIQlP)6y'
} = process.env

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '../compostia/dist')));


app.use(cors())
app.set('trust proxy', true)

/*************  GET  **************/

app.get('/', (req,res) => {
    console.log('/');
    //console.log(path.join(__dirname, '../compostia/public/index.html'));
    res.sendFile(path.join(__dirname, '../compostia/build/index.html'));
})

app.get('/help',  (req,res) => {
    console.log('/help');
    res.send(`
    <h3>Liste des url valides :</h3> 
    <a href='/liste_adresses?page=1&itemPerPage=20'>get/liste_adresses</a> <pre>récupérer la liste de toutes les adresses (+nom) avec pagination</pre><br>
    <a href='/geo_json_all'>get/geo_json_all</a><pre>récupérer un tableau avec toutes les coordonnées (x,y) de tous les composteurs de "Quartiers"</pre><br>
    <form action='/login' method='post'>post/login : 
        <input type="email" name="email" placeholder="email" value="jean.dupont@gmail.com">
        <input type="text" name="password" placeholder="password" value="Testing123">
        <input type="submit" value="ok">
    </form>
    <a href='/liste_communes'>get/liste_communes</a><pre>La liste des communes et arrondissement de lyon</pre><br>
    `)
    
})

//retourne un tableau avec toutes les communes de grand lyon et arrondissements de lyon
app.get('/api/liste_communes', async (req,res) => {
    console.log('/liste_communes');
    var options = [
        {
            host: 'download.data.grandlyon.com',
            path: `/ws/grandlyon/adr_voie_lieu.adrarrond/all.json`
        },
        {
            host: 'download.data.grandlyon.com',
            path: `/ws/grandlyon/adr_voie_lieu.adrcomgl/all.json`
        }
    ]
    var data = []
    var tabRes = []
    data.push(JSON.parse(await getFromGrandLyonAPI(options[0])).values)
    data.push(JSON.parse(await getFromGrandLyonAPI(options[1])).values)
    data.forEach(element1 => {
        element1.forEach(element2 => {
            tabRes.push({"nom":element2.nom,"insee":element2.insee})
        })
    })
    console.log('tabRes', tabRes)
    res.send(tabRes)
})


app.get('/liste_adresses', async (req,res) => {
    console.log('/liste_adresses');
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
    console.log('/geo_json_by_name');
    const { nom } = req.body;
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
    console.log('/geo_json_all');
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


/********  REGISTER  *********/

app.post('/register', (req, res) =>{
    console.log(req.body)
    //const { , codeMairie, arrondissement, nom, prenom, email, password } = req.body
})

/********  LOGIN  *********/

app.post('/login', (req, res) =>{
    console.log('/login');
    console.log('req', req)
    const { email, password } = req.body
    console.log({ email, password });
    if((email != undefined)||(password != undefined)){
        new Promise(function(resolve,reject){
            let mySqlClient = createConnection(mysql);
            let selectQuery = `CALL Connect_Uti('${escape(email)}','${escape(password)}')`;
            console.log(selectQuery)
            mySqlClient.query(      //execution de la requête
                selectQuery,
                function select(error, results) {
                    if (error) {                                //ERROR
                        console.log('error SQL :',error);
                        mySqlClient.end();
                        reject(error,selectQuery)
                    }
                    if ( results.length > 0 )  {
                        resolve(results[0])
                    } else {
                        reject("Pas de donnée ",selectQuery)
                    }
                    mySqlClient.end();
                }
            );
        }).then(function(result){
            if(result[0].res == 1){
                res.send(true)
            }else{
                res.send(false)
            }
        }).catch(function(error,selectQuery){
            console.log(error,selectQuery);
            res.send(false)
        })
    }else{
        res.send(false)
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


function createConnection(){
    return mySqlClient = mysql.createConnection({
        host     : "sabaik6fx8he7pua.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
        user     : "a828s15r67nr68up",
        password : "axkf094sdt59jgn8",
        database : "breqsvuxjx8beci0"
    });
}

function escape(str){
    return str.replace(/'|\\'/g, "\\'")
}
/*

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