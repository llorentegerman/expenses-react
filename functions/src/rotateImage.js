const functions = require('firebase-functions');

const tmpdir = require('os').tmpdir;
const { join, dirname } = require('path');

const sharp = require('sharp');
const fs = require('fs-extra');

exports.rotateImage = admin =>
    functions.https.onCall(async (data, context) => {
        const bucket = admin.storage().bucket();

        const filePath = data.path;
        const angle = data.angle;

        const fileName = filePath.split('/').pop();
        const bucketDir = dirname(filePath);

        let fileRef = bucket.file(filePath);
        let metadata = await fileRef.getMetadata();
        metadata = metadata[0];
        const contentType = metadata.contentType;

        const workingDir = join(tmpdir(), 'thumbs');
        const tmpFilePath = join(
            workingDir,
            `${new Date().getTime()}_${fileName}`
        );

        if (!contentType.includes('image')) {
            console.log('exiting function, fileName', fileName);
            return false;
        }

        // 1. Ensure thumbnail dir exists
        await fs.ensureDir(workingDir);

        // 2. Download Source File
        await fileRef.download({
            destination: tmpFilePath
        });

        const rotatedPath = join(workingDir, fileName);
        const rotatedThumbPath = join(workingDir, `thumb_${fileName}`);

        // Resize source image
        const rotatedSharp = sharp(tmpFilePath).rotate(Number(angle));

        await rotatedSharp.toFile(rotatedPath);

        await rotatedSharp
            .resize(256, 256, {
                fit: 'contain'
            })
            .toFile(rotatedThumbPath);

        // Upload to GCS
        await bucket.upload(rotatedPath, {
            destination: join(bucketDir, fileName),
            metadata: {
                metadata: {
                    resized: true
                }
            }
        });

        await bucket.upload(rotatedThumbPath, {
            destination: join(bucketDir, `thumb_${fileName}`),
            metadata: {
                metadata: {
                    resized: true
                }
            }
        });

        // 5. Cleanup remove the tmp/thumbs from the filesystem
        return fs.remove(workingDir);
    });
