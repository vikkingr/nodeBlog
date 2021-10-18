import express from 'express';
import {ResponseMessage} from '../models/ResponseMessage';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { PostResponse } from '../models/PostResponse';
import { PostRequest } from '../models/PostRequest';

const SECRET_TOKEN: string = 'DCFCC2BAACD65D8984E9F5C9B1AF8';

let arrPostResponse: PostResponse[] = [];
let arrPostRequest: PostRequest[] = [];

let postsRoute = express.Router();
postsRoute.use(express.json());
postsRoute.use(cookieParser());

postsRoute.get('/', (req, res, next) => {

    res.status(200).send(arrPostResponse);

});

postsRoute.post('/', (req, res, next) => {

    let authHeader = req.get('Authorization');

    if (!authHeader) {

        let resMsg: ResponseMessage = new ResponseMessage();
        resMsg.message = "Unauthorized - Access token is missing or invalid";
        resMsg.status = "401";
        
        res.status(401).send(resMsg);
        return;

    }

    if (!req.body.title || !req.body.content) {

        let resMsg: ResponseMessage = new ResponseMessage();
        resMsg.message = "Not Acceptable: Bad data in the entity IE: Missing Title or Content";
        resMsg.status = "406";

        res.status(406).send(resMsg);
        return;

    }

    let authToken = authHeader.split(' ')[1];

    try {

        let decodedToken = jwt.verify(authToken, SECRET_TOKEN);

        let postReq: PostRequest = req.body;

        let postRes: PostResponse = new PostResponse();
        postRes = Object.assign(postRes, postReq);
        postRes.userId = decodedToken.toString();
        postRes.postId = arrPostResponse.length + 1;
        postRes.createdDate = new Date().toDateString();
        postRes.lastUpdated = new Date().toDateString();
        
        arrPostResponse.push(postRes);
        arrPostResponse = arrPostResponse.sort((a, b) => {

            if (Date.parse(a.createdDate) < Date.parse(b.createdDate)) {
                return 1;
            } 
            if (Date.parse(a.createdDate) > Date.parse(b.createdDate)) {
                return -1;
            }
            return 0;

        });
        arrPostRequest.push(postReq);
      
        res.status(201);
        res.send(postRes);
        
    }
    catch (ex) {
        
        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "Unauthorized - Access token is missing or invalid.";
        resMsg.status = "401";

        res.status(401).send(resMsg);

        return;

    }

});

postsRoute.get('/:postId', (req, res, next) => {

    let thePosttt = arrPostResponse.find(element => element.postId.toString() == req.params.postId);

    if (thePosttt == undefined) {

        let resMsg: ResponseMessage = new ResponseMessage();
        resMsg.message = "Post Not Found";
        resMsg.status = "404";

        res.status(404).send(resMsg);
        return;

    }

    res.status(200).send(thePosttt);

});

postsRoute.patch('/:postId', (req, res, next) => {

    let authHeader = req.get('Authorization');
    if (!authHeader || authHeader == undefined) {
        let resMsg = new ResponseMessage();
        resMsg.message = "Unauthorized - Access token is missing or invalid";
        resMsg.status = "401";
        res.status(401);
        res.send(resMsg);
        return;
    }

    let authToken = authHeader.split(' ')[1];

    try {

        authToken = jwt.verify(authToken, SECRET_TOKEN).toString();

    } catch (err) {
        let resMsg = new ResponseMessage();
        resMsg.message = "Unauthorized - Access token is missing or invalid";
        resMsg.status = "401";
        res.status(parseInt(resMsg.status)).send(resMsg);
        return;
    }

    let thePostResponse = arrPostResponse.find(element => element.postId.toString() == req.params.postId);

    if (thePostResponse == undefined) {

        let resMsg: ResponseMessage = new ResponseMessage();
        resMsg.message = "Post Not Found";
        resMsg.status = "404";

        res.status(404).send(resMsg);
        return;

    }

    let indexOfPostResponse = arrPostResponse.indexOf(thePostResponse);

    if (req.body.content != undefined) {
        thePostResponse.content = req.body.content;
    }

    if (req.body.headerImage != undefined) {
        thePostResponse.headerImage = req.body.headerImage;
    }

    thePostResponse.lastUpdated = new Date().toDateString();

    arrPostResponse.splice(indexOfPostResponse, 1, thePostResponse);

    res.status(200);
    res.send(thePostResponse);

});

postsRoute.delete('/:postId', (req, res, next) => {

    let authHeader = req.get('Authorization');
    if (!authHeader || authHeader == undefined) {
        let resMsg = new ResponseMessage();
        resMsg.message = "Unauthorized - Access token is missing or invalid";
        resMsg.status = "401";
        res.status(401);
        res.send(resMsg);
        return;
    }

    let authToken = authHeader.split(' ')[1];

    try {

        authToken = jwt.verify(authToken, SECRET_TOKEN).toString();

    } catch (err) {
        let resMsg = new ResponseMessage();
        resMsg.message = "Unauthorized - Access token is missing or invalid";
        resMsg.status = "401";
        res.status(parseInt(resMsg.status)).send(resMsg);
        return;
    }

    let thePostResponse = arrPostResponse.find(element => element.postId.toString() == req.params.postId);

    if (thePostResponse == undefined) {

        let resMsg: ResponseMessage = new ResponseMessage();
        resMsg.message = "Post Not Found";
        resMsg.status = "404";

        res.status(404).send(resMsg);
        return;

    }

    let indexOfPostResponse = arrPostResponse.indexOf(thePostResponse);
    arrPostResponse.splice(indexOfPostResponse, 1);

    let resMsg = new ResponseMessage();
    resMsg.status = "204";
    resMsg.message = "Post Deleted - No Content"

    res.status(204);
    res.send(resMsg);

});

export {postsRoute}
