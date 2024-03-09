import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import urlModule from 'url';
import { customAlphabet } from 'nanoid';
import { Url } from './model/urlSchema.js';

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
}

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  const nanoid = customAlphabet('0123456789', 6);

  if (!isValidUrl(url)) {
    return res.send({ error: 'invalid url' });
  }

  const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

  if (!regex.test(url)) {
    return res.send({ error: 'invalid url' });
  }

  dns.lookup(urlModule.parse(url).hostname, async (err, address) => {
    if (!address){
      return res.send({ error: 'invalid url' });
    }

    const saveUrl = new Url({
      original_url: url,
      short_url: nanoid(),
    });

    await saveUrl.save();

    return res.status(200).send({
      original_url: saveUrl.original_url,
      short_url: saveUrl.short_url,
    });
  });
});

app.get('/api/shorturl/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = await Url.findOne({ short_url: id });

    if (!url) {
      return res.status(404).send({ error: 'Url not found' });
    }

    return res.redirect(301, url.original_url);
  } catch (error) {
    console.error('Error getting url', error);
    return res.status(500).send({ error: 'Internal server error' });
  }
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zkawiqu.mongodb.net/`,
    { dbName: 'freeCodeCamp' }
  )
  .then(() => console.log('Database connected 🌐'))
  .catch((error) => console.error('Error conecting database', error));

app.listen(port, () => console.log(`Server running on port ${port} 🚀`));
