const {conn, syncAndSeed, models:{Car, Maker}} = require('./db');
const express = require('express');
const path = require('path');

const app = express();
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(require('method-override')('_method'));
app.use(express.urlencoded({extended: false}));

app.put('/cars/:id', async(req, res, next)=>{
    try{
        console.log(req.body);
        await Car.update({color:req.body.carId},{
            where:{id:req.params.id}
        });
        res.redirect('/')
    }
    catch(ex){
        next(ex);
    }
})

app.get('/', async(req, res, next)=>{
    const [cars, makers] = await Promise.all([
        Car.findAll({
            include:[{
                model: Maker,
                as: 'brand'
            }]
        }),
        Maker.findAll({
            include:[{
                model: Car,
            }]
        })
    ]);
    try{
        res.send(`
            <html>
                <head>
                    <title> Cars Management </title>
                </head>
                <body>
                    <div>
                        <h2> Cars</h2>
                            <ul>
                                ${
                                    cars.map( car =>`
                                    <li>
                                    ${car.model}
                                    <form method='POST' action='/cars/${car.id}?_method=PUT'>
                                        <select name='carId'>
                                            <option> -- choose a color --</option>
                                            ${ cars.map(car => `
                                                <option>${car.color}</option>
                                            `).join('')}
                                        </select>
                                        <button>Save</button>
                                    </form>
                                    </li>`
                                    ).join('')
                                }
                            </ul>
                    </div>
                    <div>
                        <h2> Makers</h2>
                        <ul>
                            ${
                                makers.map(maker => `
                                <li>
                                    ${maker.name}
                                    <ul>
                                    ${
                                        maker.cars.map( car => `
                                            <li>
                                                ${car.model}, ${car.color}, ${car.category}
                                            </li>
                                        `).join('')
                                    }
                                    </ul>
                                </li>
                                `).join('')
                            }
                        </ul>
                    </div>
                </body>
            </html>
        `);
    }
    catch(ex){
        next(ex);
    }

});
app.get('/api/cars', async(req, res, next) =>{
    try{
        const cars = await Car.findAll({
            include:[
                {
                    model: Maker,
                    as: 'brand'
                }
            ]
        });
        res.send(`
        <html>
            <head>
                <link rel ='stylesheet' href='/public/styles.css' />
            </head>
            <body>
            <h1> Welcome</h1>
                <h2> Cars </h2>
                <ul>
                ${
                    cars.map(car =>`
                    <li>
                        <a href='/cars/${car.id}'>
                        ${car.model}
                    </li>
                    `).join('')
                 }
                </ul>
            </body>
        </html>
        `);
    }
    catch(ex){
        next(ex);
    }
})

app.get('/api/makers', async(req, res, next) =>{
    try{
        const makers = await Maker.findAll({});
        res.send(`
        <html>
            <head>
                <link rel ='stylesheet' href='/public/styles.css' />
            </head>
            <body>
            <h1> Welcome</h1>
                <h2> Makers </h2>
                <ul>
                ${
                    makers.map(maker =>`
                    <li>
                        ${maker.name}
                    </li>
                    `).join('')
                 }
                </ul>
            </body>
        </html>
        `);
    }
    catch(ex){
        next(ex);
    }
})

app.get('/cars/:id', async (req, res, next) =>{
    try{
        const carToShow = await Car.findByPk(req.params.id);
        const brand =  await Maker.findByPk(carToShow.brandId);
        res.send(`
        <html>
            <head>
                <link rel ='stylesheet' href='/public/styles.css' />
            </head>
            <body>
            <h1> Welcome</h1>
                <h2> ${carToShow.model} </h2>
                <ul>
                ${
                    `
                    <li>
                        ${brand.name}
                        ${carToShow.color}
                        ${carToShow.category}
                    </li>
                    `
                }
                </ul>
            </body>
        </html>
        `)
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