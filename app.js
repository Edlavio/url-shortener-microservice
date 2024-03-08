import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from  'cors'
import mongoose from 'mongoose';
import dns from 'dns';
import urlModule from 'url';
import { customAlphabet } from 'nanoid';
import { Url } from './model/urlSchema.js';

const app = express();
const port = 5000;

dotenv.config();
app.use(cors())
app.use(bodyParser.urlencoded({extended: false}));

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

  const hostname = urlModule.parse(url).hostname;
  
  if (!isValidUrl(url)) {
    return res.status(400).send({ error: 'invalid url' });
  }

<<<<<<< HEAD
  const nanoid = customAlphabet('0123456789', 6);

  dns.lookup(hostname, async (err) => {
    if (err && err.code === 'ENOTFOUND') {
=======
  dns.lookup(urlModule.parse(url).hostname, async (err, address) => {
    if (err && err.code === 'ENOTFOUND' || !address) {
>>>>>>> 1d3cfd3 (:bug: Fix: Url verification logic)
      return res.status(400).send({ error: 'invalid url' });
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
