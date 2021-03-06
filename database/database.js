/*

database.js
sqlite database

*/

// ORM for interaction with SQL database
var sequelize = require('sequelize');

// instantiates a new Sequelize database
var db = new sequelize(
  // databasa username and password do not matter for sqlite
  'database',
  'username',
  'password', {
    host: 'localhost',
    dialect: 'sqlite',
    // the pool size depends on the load the database has to handle
    // as long as this is sqlite the number can be marginally small
    pool: {
      max: 10,
      min: 2,
      // milliseconds being idle before released
      idle: 100000
    },
    storage: __dirname + '/data/db.sqlite',
    logging : false,
  });

require(__dirname + '/configDatabase.js')(db);

module.exports = db;
