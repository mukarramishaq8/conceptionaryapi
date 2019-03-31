/**
 * this file contains configuration values for db
 */
module.exports = {
    dialect: 'mysql',
    hostname: 'localhost',
    port: 3306,
    database: 'conceptionary',
    username: 'root',
    password: 'toor',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};