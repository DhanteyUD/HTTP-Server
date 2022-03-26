import http, { IncomingMessage, Server, ServerResponse } from 'http';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
let database = require('./data/database.json');

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    switch (req.method) {
      case 'GET':
        if (req.url === '/') {
          fs.mkdir('data', () => {
            fs.writeFile(
              './data/database.json',
              JSON.stringify(database, null, ' '),
              'utf8',
              (err: any) => {
                if (err) {
                  console.log("Can't find data");
                }
              }
            );
          });

          console.log(database);
          console.log(`${database.length} data ready!`);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(database));
        }
        break;
      case 'POST':
        if (req.url === '/create') {
          let isExist: any = fs.existsSync('database.json');
          if (isExist === false) {
            let body: any = '';
            req.on('data', (chunk: any) => {
              body += chunk;
            });
            req.on('end', () => {
              const {
                organization,
                createdAt,
                updatedAt,
                products,
                marketValue,
                address,
                ceo,
                country,
                noOfEmployees,
                employees,
              } = JSON.parse(body);

              const data: any = {
                organization,
                createdAt,
                updatedAt,
                products,
                marketValue,
                address,
                ceo,
                country,
                noOfEmployees,
                employees,
              };

              // Model ...
              const newData: any = { id: uuid(), ...data };
              const dataCount: number = database.push(newData);
              console.log(newData);
              console.log(
                `Data with id ${newData.id} is successfully added to database...`
              );

              fs.writeFile(
                './data/database.json',
                JSON.stringify(database, null, ' '),
                'utf8',
                (err: any) => {
                  if (err) {
                    console.log("Can't find data");
                    return null;
                  }
                  console.log(`File ${dataCount} created successfully...`);
                }
              );
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(database));
            });
          }
        }
        break;
      case 'PUT':
        if (req.url?.match(/\/data\/update\/([0-9A-Za-z]+)/)) {
          const id: string = req.url.split('/')[3];
          const newDatabase: any = database.find(
            (dataId: any) => dataId.id === id
          );
          if (!newDatabase) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Data not Found' }));
          } else {
            let body: any = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              const {
                organization,
                createdAt,
                updatedAt,
                products,
                marketValue,
                address,
                ceo,
                country,
                noOfEmployees,
                employees,
              } = JSON.parse(body);

              const datadatabase: any = {
                organization: organization || newDatabase.organization,
                createdAt: createdAt || newDatabase.createdAt,
                updatedAt: updatedAt || newDatabase.updatedAt,
                products: products || newDatabase.products,
                marketValue: marketValue || newDatabase.marketValue,
                address: address || newDatabase.address,
                ceo: ceo || newDatabase.ceo,
                country: country || newDatabase.country,
                noOfEmployees: noOfEmployees || newDatabase.noOfEmployees,
                employees: employees || newDatabase.employees,
              };

              // Model ...
              const index: number = database.findIndex(
                (dataId: any) => dataId.id === id
              );
              database[index] = { id, ...datadatabase };
              const updDatabase: any = database[index];
              console.log(updDatabase);
              console.log(
                `Data with id ${updDatabase.id} is successfully updated...`
              );

              // Util...
              fs.writeFile(
                './data/database.json',
                JSON.stringify(database, null, ' '),
                'utf8',
                (err: any) => {
                  if (err) {
                    console.log("Can't find data");
                    return null;
                  }
                  console.log(`File ${index} updated successfully...`);
                }
              );
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(updDatabase));
            });
          }
        }
        break;
      case 'DELETE':
        if (req.url?.match(/\/data\/delete\/([0-9A-Za-z]+)/)) {
          const id: string = req.url.split('/')[3];
          const newDatabase: any = database.find(
            (dataId: any) => dataId.id === id
          );
          if (!newDatabase) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Data not Found' }));
          } else {
            database = database.filter((data: any) => data.id !== id);
            console.log(database);
            console.log(`Data ${id} removed...`);
            console.log(`${database.length} files in database...`);

            fs.writeFile(
              './data/database.json',
              JSON.stringify(database, null, ' '),
              'utf8',
              (err: any) => {
                if (err) {
                  console.log("Can't find data");
                  return null;
                }
                console.log('File deleted successfully...');
              }
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: `Data ${id} removed` }));
          }
        }
        break;
      default:
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'oooops, data not found :-(' }));
        break;
    }
  }
);

const PORT: number = 5060;

server.listen(PORT, () => console.log(`server started on port ${PORT}`));

module.exports = server;
