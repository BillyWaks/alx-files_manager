import Queue from 'bull';
import { promises as fsPromises } from 'fs';
import { ObjectId } from 'mongodb';
import fileUtils from './utils/file';
import basicUtils from './utils/basic';
import imageThumbnail from 'image-thumbnail';

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

// File processing worker
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await fileUtils.getFile({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  if (!file) throw new Error('File not found');

  const { localPath } = file;
  const widths = [500, 250, 100];

  try {
    await Promise.all(
      widths.map(async (width) => {
        const options = { width };
        const thumbnail = await imageThumbnail(localPath, options);
        const thumbnailPath = `${localPath}_${width}`;
        await fsPromises.writeFile(thumbnailPath, thumbnail);
      })
    );
    console.log('Thumbnails created successfully');
  } catch (err) {
    console.error('Error creating thumbnails:', err.message);
  }
});

// User processing worker
userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) throw new Error('Missing userId');

  const user = await userUtils.getUser({ _id: ObjectId(userId) });

  if (!user) throw new Error('User not found');

  console.log(`Welcome ${user.email}!`);
});
