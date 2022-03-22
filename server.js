const http = require('http');
const fs = require('fs');
const { v4: uuid } = require('uuid');
let format = require('./format');
const PORT = 8080;

const server = http.createServer((req, res) => {
  switch (req.method) {
    case 'GET':
      if (req.url === '/read') {
        fs.mkdir('data', () => {
          fs.writeFile(
            './data/database.json',
            JSON.stringify(format, null, ' '),
            'utf8',
            (err) => {
              if (err) {
                console.log("Can't find data");
              }
            }
          );
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(format));
      }
      break;
    case 'POST':
      if (req.url === '/create') {
        let isExist = fs.existsSync('database.json');
        if (isExist === false) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            const { name, description } = JSON.parse(body);

            const data = { name, description };
            const newData = { id: uuid(), ...data };
            const dataCount = format.push(newData);
            console.log(newData);
            console.log(
              `Data with id ${newData.id} is successfully added to database...`
            );

            fs.writeFile('./data/database.json', body, 'utf8', (err) => {
              if (err) {
                console.log("Can't find data");
                return null;
              }
              console.log(`File ${dataCount} created successfully...`);
            });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newData));
          });
        }
      }
      break;
    case 'PUT':
      if (req.url?.match(/\/database\/update\/([0-9A-Za-z]+)/)) {
        const id = req.url.split('/')[3];
        const newFormat = format.find((dataId) => dataId.id === id);
        if (!newFormat) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Data not Found' }));
        } else {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            const { name, description } = JSON.parse(body);

            const dataFormat = {
              name: name || newFormat.name,
              description: description || newFormat.description,
            };

            const index = format.findIndex((dataId) => dataId.id === id);
            format[index] = { id, ...dataFormat };
            const updFormat = format[index];
            console.log(updFormat);
            console.log(
              `Data with id ${updFormat.id} is successfully updated...`
            );

            fs.writeFile('./data/database.json', body, 'utf8', (err) => {
              if (err) {
                console.log("Can't find data");
                return null;
              }
              console.log(`File ${index} updated successfully...`);
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updFormat));
          });
        }
      }
      break;
    case 'DELETE':
      if (req.url?.match(/\/database\/delete\/([0-9A-Za-z]+)/)) {
        const id = req.url.split('/')[3];
        const newFormat = format.find((dataId) => dataId.id === id);
        if (!newFormat) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Data not Found' }));
        } else {
          format = format.filter((data) => data.id !== id);
          console.log(format);
          console.log(`Data ${id} removed...`);
          console.log(`${format.length} files in database...`);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `Data ${id} removed` }));
        }
      }
      break;
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Data not Found :-(' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
