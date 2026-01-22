// Add health check endpoint to index.js
app.get('/api/health', async (req, res) => {
    try {
        // Check database connection
        const dbResult = await pool.query('SELECT NOW() as server_time');
        
        // Check if essential services are responding
        const checks = {
            database: dbResult.rows.length > 0,
            timestamp: dbResult.rows[0].server_time,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version
        };
        
        res.json({
            status: 'healthy',
            message: 'All systems operational',
            checks
        });
        
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            message: error.message,
            error: error.stack
        });
    }
});