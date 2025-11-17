module.exports = {
    apps: [
        {
            name: 'backend',
            script: 'dist/main.js',

            // Default environment
            env: {
                NODE_ENV: 'production'
            },

            // Explicit production mode
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
