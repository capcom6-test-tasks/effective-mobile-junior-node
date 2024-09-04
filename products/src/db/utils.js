const transaction = async (
    /** @type {import('pg').Pool} */ pool,
    /** @type {(client: import('pg').ClientBase) => Promise<void>} */ handler
) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await handler(client);
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

module.exports = {
    transaction,
};