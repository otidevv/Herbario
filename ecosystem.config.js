module.exports = {
  apps: [
    {
      name: "herbario",
      script: "waitress-serve",
      args: "--port=5000 app:app",
      cwd: "C:/Apache24/htdocs/App-Galery-Unamad",
      interpreter: "none",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        PYTHONUNBUFFERED: "1"
      }
    }
  ]
};
