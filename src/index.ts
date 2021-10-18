import express from 'express';
import path from 'path';
import { usersRoute } from './routes/Users';
import cors from 'cors';
import { postsRoute } from './routes/Posts';

let app = express();

app.use(express.json());
app.use(cors({credentials: true, origin: true}));

app.use(express.static(path.join(process.cwd(), 'views')));

app.use('/Users', usersRoute);
app.use('/Posts', postsRoute);

app.use('/', (req, res, next) => {

  res.sendFile(path.join(__dirname, 'views', 'index.html'));

});

app.listen(3000);
