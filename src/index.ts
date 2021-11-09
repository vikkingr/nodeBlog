import express from 'express';
import path from 'path';
import { usersRoute } from './routes/Users';
import { postsRoute } from './routes/Posts';
import { commentsRoute } from './routes/Comments';
import cors from 'cors';

let app = express();

app.use(express.json());
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));

app.use(express.static(path.join(process.cwd(), 'views')));

app.use('/Users', usersRoute);
app.use('/Posts', postsRoute);
app.use('/Comments', commentsRoute);

app.use('/', (req, res, next) => {

  res.sendFile(path.join(__dirname, 'views', 'index.html'));

});

app.listen(3000);
