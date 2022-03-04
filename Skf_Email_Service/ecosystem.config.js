module.exports = {
    apps: [
        {
            name:'skf-service',
            script: 'app.js',
            instance: 'max',
            watch: false,
            error_file: './skf_error.log',
            out_file: './skf_out.log',
            cron_restart: "1 0 * * *"
        }
    ]
}