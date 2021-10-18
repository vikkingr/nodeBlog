import express from 'express';
import {ResponseMessage} from '../models/ResponseMessage';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { CommentRequest } from '../models/CommentRequest';
import { CommentResponse } from '../models/CommentResponse';
import { arrPostResponse } from './Posts';

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

    if (arrPostResponse.length == 0) {

        let resMsg = new ResponseMessage();
        resMsg.status = "404";
        resMsg.message = "Post Not Found";
        res.status(404).send(resMsg);
        return;

    }

    let postExists: boolean = false;

    for (let i = 0; i < arrPostResponse.length; i++) {
        
        if (arrPostResponse[i].postId == parseInt(req.params.postId)) {

            postExists = true;
            break;

        }

    }

    if (!postExists) {

        let resMsg = new ResponseMessage();
        resMsg.status = "404";
        resMsg.message = "Post Not Found";
        res.status(404).send(resMsg);
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

commentsRoute.delete('/:postId/:commentId', (req, res, next) => {

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

    if (arrPostResponse.length == 0 || arrCommentRes.length == 0) {

        console.log(" here 1");

        let resMsg = new ResponseMessage();
        resMsg.status = "404";
        resMsg.message = "Comment or Post Not Found";
        res.status(404).send(resMsg);
        return;

    }

    let postExists: boolean = false;
    let commentExists: boolean = false;

    for (let i = 0; i < arrPostResponse.length; i++) {
        
        if (arrPostResponse[i].postId == parseInt(req.params.postId)) {

            postExists = true;

        }
        if (arrCommentRes[i].commentId == parseInt(req.params.commentId)) {

            commentExists = true;

        }

    }

    if (!postExists || !commentExists) {

        let resMsg = new ResponseMessage();
        resMsg.status = "404";
        resMsg.message = "Comment or Post Not Found";
        res.status(404).send(resMsg);
        return;

    }

    let commentToDel = arrCommentRes.find(element => element.commentId == parseInt(req.params.commentId));

    let indexOfCommentRes = arrCommentRes.indexOf(commentToDel!);
    arrCommentRes.splice(indexOfCommentRes, 1);

    let resMsg = new ResponseMessage();
    resMsg.status = "204";
    resMsg.message = "Post Deleted - No Content"

    res.status(204);
    res.send(resMsg);

});

commentsRoute.get('/:postId', (req, res, next) => {

    let subArrCommentRes = arrCommentRes.filter(e => e.postId == parseInt(req.params.postId));

    res.status(200).send(subArrCommentRes);

});

export { commentsRoute };
