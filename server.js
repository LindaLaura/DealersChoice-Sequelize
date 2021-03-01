const {conn, syncAndSeed, models:{Car, Maker}} = require('./db');
const express = require('express');

const app = express();

app.get('/api/cars', async(req, res, next) =>{
    try{
        res.send(await Car.findAll({
            include:[
                {
                    model: Maker,
                    as: 'brand'
                }
            ]
        }));
    }
    catch(ex){
        next(ex);
    }
})

app.get('/api/makers', async(req, res, next) =>{
    try{
        res.send(await Maker.findAll());
    }
    catch(ex){
        next(ex);
    }
})

const init = async() => {
    try{
        await conn.authenticate();
        await syncAndSeed();
        const port = process.env.PORT || 1337;
        app.listen(port, ()=> console.log(`Listening on port: ${port} ...`))
    }
    catch(ex){
        console.log(ex);
    }
};

init();