import express from 'express';
import {User} from '../models/User';
import {UserCopy} from '../models/UserCopy';
import {ResponseMessage} from '../models/ResponseMessage';
import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt';
import cookieParser from 'cookie-parser';

const SECRET_TOKEN: string = 'DCFCC2BAACD65D8984E9F5C9B1AF8';

let arrUser: User[] = [];
let arrUserCopy: UserCopy[] = [];
let emailRegExp: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

let usersRoute = express.Router();
usersRoute.use(express.json());
usersRoute.use(cookieParser());

usersRoute.get('/', (req, res, next) => {

    let authHeader = req.get('Authorization');
  
    if (authHeader) {

        let authToken = authHeader.split(' ')[1];
        authToken = JSON.parse(authToken).token;
        
        try {

            let decodedToken = jwt.verify(authToken, SECRET_TOKEN);
          
            res.status(200);
            res.send(arrUserCopy);
            
        }
        catch (ex) {
            
            let resMsg: ResponseMessage = new ResponseMessage;
            resMsg.message = "Unauthorized - Access token is missing or invalid.";
            resMsg.status = "401";

            res.status(401).send(resMsg);

            return;

        }
        
    } else {

        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "Unauthorized - Access token is missing or invalid.";
        resMsg.status = "401";

        res.status(401).send(resMsg);

    }
  
});
  
usersRoute.get('/:userId', (req, res, next) => {

    let authHeader = req.get('Authorization');
  
    if (authHeader) {

        let authToken = authHeader.split(' ')[1];
        authToken = JSON.parse(authToken).token;

        try {

            let decodedToken = jwt.verify(authToken, SECRET_TOKEN);
            
            if (arrUserCopy.find(element => element.userId === req.params.userId) === undefined) {
      
                let resMsg: ResponseMessage = {message: "User Not Found!", status: "404"}
          
                res.status(404);
                res.send(resMsg);
          
                return;
          
            }
          
            res.status(200);
            res.send(arrUserCopy.find(element => element.userId === req.params.userId));
            
        }
        catch (ex) {
            
            let resMsg: ResponseMessage = new ResponseMessage;
            resMsg.message = "Unauthorized - Access token is missing or invalid.";
            resMsg.status = "401";

            res.status(401).send(resMsg);

            return;

        }
        
    } else {

        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "Unauthorized - Access token is missing or invalid.";
        resMsg.status = "401";

        res.status(401).send(resMsg);

    }
  
});

usersRoute.get('/:userId/:password', (req, res, next) => {

    let user = arrUser.find(element => element.userId === req.params.userId);

    if (user) {

        bcrypt.compare(req.params.password, user.password, function (err, result) {

            if (result == true) {

                let myToken = jwt.sign({'userId':user!.userId}, SECRET_TOKEN);

                res.status(200);
                res.send({token: myToken});

                return;

            }
            else {

                let resMsg: ResponseMessage = new ResponseMessage;
        
                resMsg.message = "Wrong username or password.";
                resMsg.status = "401";
        
                res.status(401).send(resMsg);
                return;
        
            }

        });

        // if (user.password == req.params.password) {

        //     let myToken = jwt.sign(user, SECRET_TOKEN);

        //     res.cookie('authToken', myToken);
        //     res.status(200).send({token: myToken});

        // }

    }
    else {

        let resMsg: ResponseMessage = new ResponseMessage;

        resMsg.message = "Wrong username or password.";
        resMsg.status = "401";

        res.status(401).send(resMsg);
        return;

    }
    
});
  
usersRoute.post('/', (req, res, next) => {
  
    if ( req.body === undefined ||
        req.body.userId === undefined || 
        req.body.firstName === undefined || 
        req.body.lastName === undefined || 
        req.body.emailAddress === undefined || 
        req.body.password === undefined ) {
  
        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "All fields must be filled in.";
        resMsg.status = "406";
        res.status(406);
        res.send(resMsg);
  
        return;
  
    }

    if ( !emailRegExp.test(req.body.emailAddress) ) {

        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "Invalid Email.";
        resMsg.status = "406";
        res.status(406);
        res.send(resMsg);
  
        return;

    }
  
    if ( arrUser.find(element => element.userId === req.body.userId) !== undefined ) {
  
        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "This userId already exists.";
        resMsg.status = "409";
        res.status(409);
        res.send(resMsg);
  
        return;
  
    }
  
    let newUser: User = req.body;
    // newUser.userId = req.body.userId;
    // newUser.firstName = req.body.firstName;
    // newUser.lastName = req.body.lastName;
    // newUser.emailAddress = req.body.emailAddress;
    // newUser.password = req.body.password;
  
    arrUser.push(newUser);
  
    let newUserCopy: UserCopy = new UserCopy();
    newUserCopy.userId = newUser.userId;
    newUserCopy.firstName = newUser.firstName;
    newUserCopy.lastName = newUser.lastName;
    newUserCopy.emailAddress = newUser.emailAddress;
  
    arrUserCopy.push(newUserCopy);

    bcrypt.genSalt(2, function (err, salt) {

        bcrypt.hash(newUser.password, salt, function (err, hash) {
            
            let index = arrUser.indexOf(newUser);

            arrUser[index].password = hash;

        });

    });

    res.status(201);
    res.send(newUserCopy);
  
});
  
usersRoute.patch('/:userId', (req, res, next) => {
  
    let authHeader = req.get('Authorization');
  
    if (authHeader) {

        let authToken = authHeader.split(' ')[1];    
        authToken = JSON.parse(authToken).token;

        try {

            let decodedToken = jwt.verify(authToken, SECRET_TOKEN);
          
            let userToReplace = arrUser.find(element => element.userId === req.params.userId);
            let userCopyToReplace = arrUserCopy.find(element => element.userId === req.params.userId);
            
            if ( userToReplace === undefined ) {
        
                let resMsg: ResponseMessage = new ResponseMessage;
                resMsg.message = "This user does not exist.";
                resMsg.status = "404";
                res.status(404);
                res.send(resMsg);
        
                return;
        
            }
        
            if ( userCopyToReplace === undefined ) {
        
                let resMsg: ResponseMessage = new ResponseMessage;
                resMsg.message = "This user does not exist.";
                resMsg.status = "404";
                res.status(404);
                res.send(resMsg);
            
                return;
        
            }
            
            if (req.body.emailAddress) {

                if ( !emailRegExp.test(req.body.emailAddress) ) {
        
                    let resMsg: ResponseMessage = new ResponseMessage;
                    resMsg.message = "Invalid Email.";
                    resMsg.status = "406";
                    res.status(406);
                    res.send(resMsg);
              
                    return;
            
                }

            }
        
            let indexOfUser = arrUser.indexOf(userToReplace);
            let indexOfUserCopy = arrUserCopy.indexOf(userCopyToReplace);
        
            let newFirstName: string = req.body.firstName;
            let newLastName: string = req.body.lastName;
            let newEmailAddress: string = req.body.emailAddress;
            let newPassword: string = req.body.password;
            
            if (newFirstName !== undefined && newFirstName !== null && newFirstName !== "") {
        
                userToReplace.firstName = newFirstName;
                userCopyToReplace.firstName = newFirstName;
        
            }
        
            if (newLastName !== undefined && newLastName !== null && newLastName !== "") {
        
                userToReplace.lastName = newLastName;
                userCopyToReplace.lastName = newLastName;
        
            }
        
            if (newEmailAddress !== undefined && newEmailAddress !== null && newEmailAddress !== "") {
        
                userToReplace.emailAddress = newEmailAddress;
                userCopyToReplace.emailAddress = newEmailAddress;
        
            }
        
            if (newPassword !== undefined && newPassword !== null && newPassword !== "") {
        
                userToReplace.password = newPassword;
        
            }
        
            arrUser.splice(indexOfUser, 1, userToReplace);
            arrUserCopy.splice(indexOfUserCopy, 1, userCopyToReplace);
        
            res.status(200);
            res.send(userCopyToReplace);
            
        }
        catch (ex) {
            
            let resMsg: ResponseMessage = new ResponseMessage;
            resMsg.message = "Unauthorized - Access token is missing or invalid.";
            resMsg.status = "401";

            res.status(401).send(resMsg);

            return;

        }
        
    } else {

        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "Unauthorized - Access token is missing or invalid.";
        resMsg.status = "401";

        res.status(401).send(resMsg);

    } // the auth stuff
  
});
  
usersRoute.delete('/:userId', (req, res, next) => {

    let authHeader = req.get('Authorization');
  
    if (authHeader) {

        let authToken = authHeader.split(' ')[1];
        authToken = JSON.parse(authToken).token;

        try {

            let decodedToken = jwt.verify(authToken, SECRET_TOKEN);
          
            let userToDelete = arrUser.find(element => element.userId === req.params.userId);
            let userCopyToDelete = arrUserCopy.find(element => element.userId === req.params.userId);
            
            if ( userToDelete === undefined ) {
        
                let resMsg: ResponseMessage = new ResponseMessage;
                resMsg.message = "This user does not exist.";
                resMsg.status = "404";
                res.status(404);
                res.send(resMsg);
            
                return;
        
            }
        
            if ( userCopyToDelete === undefined ) {
        
                let resMsg: ResponseMessage = new ResponseMessage;
                resMsg.message = "This user does not exist.";
                resMsg.status = "404";
                res.status(404);
                res.send(resMsg);
            
                return;
        
            }
        
            let indexOfUser = arrUser.indexOf(userToDelete);
            let indexOfUserCopy = arrUserCopy.indexOf(userCopyToDelete);
        
            arrUser.splice(indexOfUser, 1);
            arrUserCopy.splice(indexOfUserCopy, 1);
        
            let resMsg: ResponseMessage = new ResponseMessage;
            resMsg.message = "This user has been deleted.";
            resMsg.status = "204";
        
            res.status(204);
            res.send(resMsg);
            
        }
        catch (ex) {
            
            let resMsg: ResponseMessage = new ResponseMessage;
            resMsg.message = "Unauthorized - Access token is missing or invalid.";
            resMsg.status = "401";

            res.status(401).send(resMsg);

            return;

        }
        
    } else {

        let resMsg: ResponseMessage = new ResponseMessage;
        resMsg.message = "Unauthorized - Access token is missing or invalid.";
        resMsg.status = "401";

        res.status(401).send(resMsg);

    }
  
});

export {usersRoute}
