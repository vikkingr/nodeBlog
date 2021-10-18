import express from 'express';
import {ResponseMessage} from '../models/ResponseMessage';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { CommentRequest } from '../models/CommentRequest';
import { CommentResponse } from '../models/CommentResponse';

const SECRET_TOKEN: string = 'DCFCC2BAACD65D8984E9F5C9B1AF8';
let arrCommentRes: CommentResponse[] = [];

let commentsRoute = express.Router();
commentsRoute.use(express.json());

commentsRoute.post('/:postId', (req, res, next) => {

    let authHeader = req.get('Authorization');

    if (!authHeader || authHeader == undefined) {
        let resMsg = new ResponseMessage();
        resMsg.status = "401";
        resMsg.message = "Unauthorized - Access token is missing or invalid";
        res.status(401).send(resMsg);
        return;
    }

    let authToken = authHeader.split(" ")[1];

    try {
        authToken = jwt.verify(authToken, SECRET_TOKEN).toString();
    } catch (err) {
        let resMsg = new ResponseMessage();
        resMsg.status = "401";
        resMsg.message = "Unauthorized - Access token is missing or invalid";
        res.status(401).send(resMsg);
        return;
    }

    let commentToAdd = new CommentRequest();
    let commentRes = new CommentResponse();

    commentToAdd = req.body;
    commentRes.comment = commentToAdd.comment;
    commentRes.commentDate = new Date().toDateString();
    commentRes.postId = parseInt(req.params.postId);
    commentRes.userId = authToken;
    commentRes.commentId = arrCommentRes.length;
    arrCommentRes.push(commentRes);

    res.status(201).send(commentRes);

});

