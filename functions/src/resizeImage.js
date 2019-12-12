const functions = require('firebase-functions');

const tmpdir = require('os').tmpdir;
const { join, dirname } = require('path');

const sharp = require('sharp');
const fs = require('fs-extra');

exports.resizeImage = admin =>
    functions.storage.object().onFinalize(async object => {
        const bucket = admin.storage().bucket(object.bucket);

        const filePath = object.name;
        const fileName = filePath.split('/').pop();
        const bucketDir = dirname(filePath);

        let fileRef = bucket.file(filePath);
        const metadata = await fileRef.getMetadata();

        const workingDir = join(tmpdir(), 'thumbs');
        const tmpFilePath = join(workingDir, 'source.png');

        if (
            fileName.includes('thumb_') ||
            !object.contentType.includes('image') ||
            (metadata &&
                metadata[0] &&
                metadata[0].metadata &&
                metadata[0].metadata.resized)
        ) {
            console.log(
                'exiting function, fileName',
                fileName,
                'object.contentType',
                object.contentType
            );
            console.log(metadata);

            return false;
        }

        // 1. Ensure thumbnail dir exists
        await fs.ensureDir(workingDir);

        // 2. Download Source File
        await fileRef.download({
            destination: tmpFilePath
        });

        // 3. Resize the images and define an array of upload promises
        const sizes = [256, 1024];

        // const [sheetId, expenseId] = bucketDir.split('/');
        const uploadPromises = sizes.map(async size => {
            const thumbName = size !== 1024 ? `thumb_${fileName}` : fileName;
            const thumbPath = join(workingDir, thumbName);

            // Resize source image
            await sharp(tmpFilePath)
                .resize(size, size, {
                    fit: 'contain'
                })
                .toFile(thumbPath);

            // Upload to GCS
            return bucket.upload(thumbPath, {
                destination: join(bucketDir, thumbName),
                metadata: {
                    metadata: {
                        resized: true
                    }
                }
            });
        });

        // 4. Run the upload operations
        await Promise.all(uploadPromises);

        // 5. Cleanup remove the tmp/thumbs from the filesystem
        return fs.remove(workingDir);
    });
