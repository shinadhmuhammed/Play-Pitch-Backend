import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';

cloudinary.config({
    cloud_name: 'dgm5kjzbr',
    api_key: '136395618466661',
    api_secret: '9uDgciRMSt2vrC34KfMywbdH-pk'
});

const fileUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.file) {
            return res.status(400).json({ error: 'No file found in the request body' });
        }

        // Assuming 'file' is the name of the field where the file is stored in the request body
        const upload = await cloudinary.uploader.upload(req.body.file, { resource_type: 'auto' });

        // If upload is successful, you can send a response or do other processing
        return res.status(200).json({ success: true, data: upload });
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default fileUpload;
