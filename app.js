const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./models/mysql');

const memoireRoutes = require('./routes/memoire.routes');
const typeDocumentRoutes = require('./routes/typedocument.routes');
const testRoutes = require('./routes/testRoutes.routes');

const app = express();

// Allow file upload
app.use(fileUpload({
    createParentPath: true
}));

// Allow cors
app.use(cors());

// Needed to limit for the validation of highlights
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(bodyParser.json({limit: '200mb'}));

// Sync database
db.sequelize.sync();

// Define main routes
app.get('/api', (req, res) => {
    res.json({
        message: 'It works'
    });
});

// Memoire routes api
app.use('/api/memoires', memoireRoutes);

// TypeDocument routes api
app.use('/api/types', typeDocumentRoutes);

// Test api
app.use('/api/test', testRoutes);

// Launch the server
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port);
