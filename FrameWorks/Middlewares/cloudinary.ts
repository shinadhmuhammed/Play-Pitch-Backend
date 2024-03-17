import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'; 


cloudinary.config({
    cloud_name: 'dgm5kjzbr',
    api_key: '136395618466661',
    api_secret: '9uDgciRMSt2vrC34KfMywbdH-pk'
});


export const cloudinaryInstance = cloudinary;