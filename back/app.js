const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const https = require('https')
const mysql = require('mysql')
const path = require('path');

var cors = require('cors')

/**
 * Codes d'inscriptions dispo :
 * 
 * DECINES-CHARPIEU     69275       741852963
 * SAINT-PRIEST         69290       965487123
 * GIVORS               69091       154872369
 * SAINTE-FOY-LES-LYON  69202       325418769
 * LYON 7EME            69387       215496387
 * LYON 7EME            69387       145236902
 * LYON 7EME            69387       365147820
 * LYON 7EME            69387       102020140
 */

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



app.get('/', (req,res) => {
    console.log('/');
    //console.log(path.join(__dirname, '../compostia/public/index.html'));
    //res.sendFile(path.join(__dirname, '../compostia/build/index.html'));
    res.redirect('/help')
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
        <pre>Retourne true si l'utilisateur est connecté</pre>
    </form>
    <a href='/liste_communes'>get/liste_communes</a><pre>La liste des communes et arrondissement de lyon</pre><br>
    <a href='/qr_code?email=andres@a.com'>get/qr_code</a><pre>récupérer le qrcode d'un utilisateur via son email</pre><br>
    <a href='/points?email=andres@a.com'>get/points</a><pre>récupérer le nb de points d'un utilisateur via son email</pre><br>
    <form action='/add10points' method='post'>post/add10points : 
        <input type="text" name="qrcode" placeholder="qrcode" value="61366530343039362D323938392D3131">
        <input type="submit" value="ok">
        <pre>Ajouter 10 points à un utilisateur via qrcode</pre>
    </form>
    <form action='/substractXPoints' method='post'>post/substractXPoints : 
        <input type="text" name="qrcode" placeholder="qrcode" value="61366530343039362D323938392D3131">
        <input type="number" name="points" placeholder="points" value="10">
        <input type="submit" value="ok">
        <pre>Supprimer X points à un utilisateur via qrcode</pre>
    </form>
    `);
    
})

/**************** LISTES ***************/

//retourne un tableau avec toutes les communes de grand lyon et arrondissements de lyon
app.get('/liste_communes', async (req,res) => {
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
    let indexTab = tabRes.findIndex((element) => element.nom == 'LYON')
    tabRes.splice(indexTab,1)
    res.send(tabRes)
})


//retourne une liste avec les adresses de tous les composteurs "Quartiers"
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
    res.send(data.values)
})

/**************** GESTION POINTS *****************/

app.post('/add10points', async (req,res) => {
    console.log('/add10points');
    const { qrcode } = req.body;
    let request = `CALL add_10_points('${escape(qrcode)}')`;
    res.send(await requeteClassiqueSansRetour(qrcode,request));
})

app.get('/points', async (req,res) => {
    console.log(req._parsedOriginalUrl.path)
    const { email } = req.query;
    let request = `SELECT points_Uti FROM utilisateur WHERE Email_Uti='${escape(email)}'`;
    res.send(await requeteClassiqueAvecRetour(email,request,'points_Uti','points'));
})

app.post('/substractXPoints', async (req,res) => {
    console.log('/substractXPoints');
    const { qrcode, points } = req.body;
    console.log({ qrcode, points })
    let request = `CALL subtract_x_points('${escape(qrcode)}',${points})`;
    console.log(request)
    res.send(await requeteClassiqueAvecRetour(qrcode,request,'res'));
})

/**************** QRCODE *****************/

app.get('/qr_code', async (req,res) => {
    console.log(req._parsedOriginalUrl.path)
    const { email } = req.query;
    let request = `SELECT QRCode_Uti FROM utilisateur WHERE Email_Uti='${escape(email)}'`;
    res.send(await requeteClassiqueAvecRetour(email,request,'QRCode_Uti','qrcode'));
})

/**************** GEO JSON *****************/

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
        delete element.properties.infoloc;
        delete element.properties.typesite;
        delete element.properties.url;
        delete element.properties.gid;
        tabRes.push({"properties":element.properties,"coordinates":[element.geometry.coordinates[1],element.geometry.coordinates[0]]})
    })
    res.send(tabRes)
})


/********  REGISTER  *********/

app.post('/register', (req, res) =>{
    console.log('/register')
    const { typeUtilisateur,nom,prenom,email,motDePasse,mairie,acceptCGU,codeInscription } = req.body;
    if(acceptCGU && (email!=undefined)){
        if(typeUtilisateur=='particulier'){
            new Promise(function(resolve,reject){
                let mySqlClient = createConnection(mysql);
                let selectQuery = `CALL Inscription_Uti('${escape(motDePasse)}','${escape(nom)}','${escape(prenom)}','${escape(email)}',1,'','')`;
                mySqlClient.query(      //execution de la requête
                    selectQuery,
                    function select(error, results) {
                        if (error) {                                //ERROR
                            console.log('error SQL :',error);
                            mySqlClient.end();
                            reject(error,selectQuery)
                        }else{
                            mySqlClient.end();
                            resolve()
                        }
                    }
                );
            }).then(function(){
                res.send({"success":true})
            }).catch(function(error,selectQuery){
                console.log(error,selectQuery);
                res.send({"success":false,"msg":error})
            })
        }else if((typeUtilisateur=='collectivite') && ((codeInscription!=undefined) && (codeInscription!='')) && ((mairie!=undefined) && (mairie!=''))){
            new Promise(function(resolve,reject){
                let mySqlClient = createConnection(mysql);
                let selectQuery = `CALL CheckCode('${escape(mairie)}',${escape(codeInscription)})`;
                mySqlClient.query(      //execution de la requête
                    selectQuery,
                    function select(error, results) {
                        if (error) {                                //ERROR
                            console.log('error SQL :',error);
                            mySqlClient.end();
                            reject(error,selectQuery)
                        }
                        mySqlClient.end();
                        if ( results.length > 0 )  {
                            resolve(results[0][0])
                        } else {
                            reject("Pas de donnée ",selectQuery)
                        }
                        

                    }
                );
            }).then(function(resultCode){
                if(resultCode.res==1){
                    new Promise(function(resolve,reject){
                        let mySqlClient = createConnection(mysql);
                        let selectQuery = `CALL Inscription_Uti('${escape(motDePasse)}','${escape(nom)}','${escape(prenom)}','${escape(email)}',1,'${typeUtilisateur}','${mairie}')`;
                        console.log(selectQuery)
                        mySqlClient.query(      //execution de la requête
                            selectQuery,
                            function select(error, results) {
                                if (error) {                                //ERROR
                                    console.log('error SQL :',error);
                                    mySqlClient.end();
                                    reject(error,selectQuery)
                                }else{
                                    mySqlClient.end();
                                    resolve()
                                }
                            }
                        );
                    }).then(function(){
                        res.send({"success":true})
                    }).catch(function(error,selectQuery){
                        console.log(error,selectQuery);
                        res.send({"success":false,"msg":error})
                    })
                }else{
                    res.send({"success":false,"msg":"Code d'inscription en tant que membre collectivité incorrect."})
                }
            }).catch(function(error,selectQuery){
                console.log(error,selectQuery);
                res.send({"success":false,"msg":error})
            })
        }else{
            res.send({"success":false,"msg":"Code d'inscription ou Mairie non renseigné"})
        }
    }
})

/********  LOGIN  *********/

app.post('/login', (req, res) =>{
    console.log('/login');
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
                    mySqlClient.end();
                    if ( results.length > 0 )  {
                        resolve(results[0])
                    } else {
                        reject("Pas de donnée ",selectQuery)
                    }
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

function requeteClassiqueSansRetour(id,requete){
    if((id != undefined) && (id != '')){
        return new Promise(function(resolve,reject){
            let mySqlClient = createConnection(mysql);
            let selectQuery = requete;
            mySqlClient.query(      //execution de la requête
                selectQuery,
                function select(error, results) {
                    if (error) {                                //ERROR
                        console.log('error SQL :',error);
                        mySqlClient.end();
                        reject(error,selectQuery)
                    }else{
                        mySqlClient.end();
                        resolve()
                    }
                }
            );
        }).then(function(){
            console.log({"success":true})
            return {"success":true}
        }).catch(function(error,selectQuery){
            console.log(error,selectQuery);
            return {"success":false,"msg":error}
        })
    }else{
        return {"success":false,"msg":`id non renseigné`}
    }
}

function requeteClassiqueAvecRetour(id,requete,returnName,nameVal){
    if((id != undefined) && (id != '')){
        return new Promise(function(resolve,reject){
            let mySqlClient = createConnection(mysql);
            let selectQuery = requete;
            mySqlClient.query(      //execution de la requête
                selectQuery,
                function select(error, results) {
                    if (error) {                                //ERROR
                        console.log('error SQL :',error);
                        mySqlClient.end();
                        reject(error,selectQuery)
                    }
                    mySqlClient.end();
                    if ( results.length > 0 )  {
                        resolve(results[0])
                    } else {
                        reject("Pas de donnée ",selectQuery)
                    }
                }
            );
        }).then(function(result){
            console.log({"success":true, "property": nameVal, "val":result[returnName]})
            return {"success":true, "property": nameVal, "val":result[returnName]}
        }).catch(function(error,selectQuery){
            console.log(error,selectQuery);
            return {"success":false,"msg":error}
        })
    }else{
        return {"success":false,"msg":"id non renseigné"}
    }
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