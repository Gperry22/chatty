const express = require('express');
const path = require('path');


var app = express();

const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '/public')));
// app.use(express.static("nodules/bootstrap/dist"));


app.listen(PORT, () => {
	console.log(`Listening on PORT ${PORT}`);
});