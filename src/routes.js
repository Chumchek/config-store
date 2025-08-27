const express = require('express');
const { KV } = require('./models');

const apiRouter = express.Router();

// GET /api/kv - получить все пары ключ-значение
apiRouter.get('/kv', async (req, res) => {
    try {
        const records = await KV.findAll();
        const result = records.map(record => ({
            key: record.key,
            value: record.value
        }));
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching all key-values:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/kv/:key - получить значение по ключу
apiRouter.get('/kv/:key', async (req, res) => {
        const { key } = req.params;
    try {
        const record = await KV.findOne({ where: { key } });
        if (record) {
            res.json({ key: record.key, value: record.value });
        } else {
            res.status(404).json({ error: 'Key not found' });
        }
    }
    catch (error) {
        console.error('Error fetching key-value:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

apiRouter.post('/kv', async (req, res) => {
    const { key, value } = req.body;
    if (!key || !value) {
        return res.status(400).json({ error: 'Key and value are required' });
    }
    try {
        const existingKV = await KV.findOne({ where: { key } });
        if (existingKV) {
            return res.status(409).json({ error: 'Key already exists in database' });
        } else {
            const newKV = await KV.create({ key, value });
            res.status(201).json({ key: newKV.key, value: newKV.value });
        }
    }
    catch (error) {
        console.error('Error creating key-value:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

apiRouter.put('/kv/:key', async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!value) {
        return res.status(400).json({ error: 'Value is required' });
    }
    
    try {
        const [updatedCount, updatedRows] = await KV.update(
            { value }, 
            { 
                where: { key }, 
                returning: true // Возвращает обновленные записи (работает в PostgreSQL)
            }
        );
        
        if (updatedCount === 0) {
            return res.status(404).json({ error: 'Key not found' });
        }
        
        // В PostgreSQL updatedRows содержит обновленные записи
        const updatedRecord = updatedRows[0];
        res.json({ key: updatedRecord.key, value: updatedRecord.value });
    }
    catch (error) {
        console.error('Error updating key-value:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

apiRouter.delete('/kv/:key', async (req, res) => {
    const { key } = req.params;
    
    try {
        const existingKV = await KV.findOne({ where: { key } });
        if (!existingKV) {
            return res.status(404).json({ error: 'Key not found' });
        }
        
        await existingKV.destroy();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting key-value:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = apiRouter;