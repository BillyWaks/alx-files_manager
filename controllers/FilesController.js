import express from 'express';
import { promises as fsPromises } from 'fs';
import { ObjectId } from 'mongodb';
import fileUtils from '../utils/file';

const router = express.Router();

// POST /files - Upload a file
router.post('/files', async (req, res) => {
  try {
    const { file, userId } = req.body; // Assume file and userId are provided via multipart or JSON.

    if (!file || !userId) {
      return res.status(400).send({ error: 'Missing file or userId' });
    }

    const isImage = file.mimetype.startsWith('image/');
    const newFile = await fileUtils.saveFile(file, userId);

    if (isImage) {
      fileQueue.add({ fileId: newFile._id, userId });
    }

    res.status(201).send(newFile);
  } catch (err) {
    console.error('Error uploading fil
