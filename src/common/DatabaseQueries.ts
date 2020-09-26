import {Pool} from 'pg';

const pool = new Pool({
    host: 'localhost',
    database: 'smartbear',
    user: 'me',
    password: 'pw'
})