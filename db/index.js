const Sequelize = require('sequelize');
const { STRING, UUID, UUIDV4} = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/dealers_cjoice_sequelize_db');


const Car = conn.define('car', {
    id:{
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    model:{
        type: STRING,
        allowNull: false, 
    },
    color:{
        type: STRING,
        allowNull: false,
    },
    category:{
        type: STRING,
        allowNull: false,
    }
});

const Maker = conn.define('maker', {
    id:{
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name:{
        type: STRING,
        allowNull: false,
    }
});

Car.belongsTo(Maker, {as: 'brand'});
Maker.hasMany(Car, {foreignKey: 'brandId'})

const syncAndSeed = async () => {
    await conn.sync({force: true});
    const [RAV4, Murano, Camry, Series, Model_Y, Toyota, Nissan, BMW, Tesla] = await Promise.all([
       Car.create({model:'RAV4',
                   color:'black',
                   category:'SUV'}
        ), 
       Car.create({model:'Murano',
                   color:'white',
                   category:'SUV'}
        ),
       Car.create({model:'Camry',
                   color:'red',
                   category:'compact'}
       ),
       Car.create({model:'Series',
                   color:'red',
                   category:'luxury car'}
        ),
        Car.create({model:'Model_Y',
                    color:'gray',
                    category:'luxury convertible'}
        ),
       Maker.create({name:'Toyota'}),
       Maker.create({name:'Nissan'}),
       Maker.create({name:'BMW'}),
       Maker.create({name:'Tesla'}),
    ]);

    Model_Y.brandId = Tesla.id;
    Series.brandId = BMW.id;
    Camry.brandId = Toyota.id;
    RAV4.brandId = Toyota.id;
    Murano.brandId = Nissan.id;
    await Model_Y.save();
    await Series.save();
    await Camry.save();
    await RAV4.save();
    await Murano.save();
}

module.exports = {
    conn,
    syncAndSeed,
    models:{
        Car,
        Maker
    }
}