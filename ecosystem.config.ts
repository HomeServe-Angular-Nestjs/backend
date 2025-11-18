module.exports = {
    apps: [
        {
            name: 'backend',
            script: 'dist/src/main.js',

            // Default environment
            env: {
                NODE_ENV: 'production',
                MONGO_URI: 'mongodb+srv://sajid189210:RFJ5rVdxHb8QM5nK@cluster0.urxscp5.mongodb.net/HomeServe'
            },

            // Explicit production mode
            env_production: {
                NODE_ENV: 'production',
                MONGO_URI: 'mongodb+srv://sajid189210:RFJ5rVdxHb8QM5nK@cluster0.urxscp5.mongodb.net/HomeServe'
            }
        }
    ]
};
