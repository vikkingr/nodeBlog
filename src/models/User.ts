class User {

    userId: string = "";
    firstName: string = "";
    lastName: string = "";
    emailAddress: string = "";
    password: string = "";

    ValidatePassword(password: string): boolean {
        if ( this.password === password ) {
            return true;
        }
        return false;
    }

}

export {User};
