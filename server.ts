import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './FrameWorks/Routes/userRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/', userRouter);



mongoose.connect('mongodb://127.0.0.1:27017/PlayPitch');

const db = mongoose.connection;


db.once('connected', () => {
    console.log('MongoDB connected successfully');
    
    
    app.listen(3001, () => {
        console.log('Server started on port 3001');
    });
});




function session(arg0: { secret: string; resave: boolean; saveUninitialized: boolean; }): any {
    throw new Error('Function not implemented.');
}

