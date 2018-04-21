const http = require('http'),
	express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	config = require('./config/main'),
	router = require('./controllers/router'),
	path = require("path");

mongoose.connect(config.database.uri, err =>
	console.log(err ? err : 'Database: Connected'));
mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'build')));

const dev = app.get('env') === 'development';
if (dev) {
	app.use(morgan('dev'));
} else {
	app.disable('x-powered-by');
	app.use(morgan('common'));
}

router(app);
if (!dev) app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'build', 'index.html')));

const server = http.createServer(app);
server.listen(config.port, err => console.log(err ? err : `Server: Running\nPort: ${config.port}`));
