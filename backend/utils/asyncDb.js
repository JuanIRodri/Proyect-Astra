let pool;

function getPool() {
    if (!pool) {
        pool = require('../config/db');
    }
    return pool;
}

async function query(sql, params) {
    const [rows] = await getPool().promise().query(sql, params);
    return rows;
}

async function withTransaction(run) {
    const connection = await getPool().promise().getConnection();
    try {
        await connection.beginTransaction();
        const result = await run(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { query, withTransaction };