# Getting Started
To get the Node server running locally:
  - Clone this repo
  - ```npm install``` to install all required dependencies
  -  Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing ```mongod```
  -  ```npm run dev``` 
# Code Overview
## Project Structure
```
app
 |  server.js         # App entry point
 |
 |- config            # Environment variables
 |   └─ index.js        # Set Environment variables
 |
 |- controllers       # All the Business logic
 |   |- auth.js         # User Account Management/Authentication
 |   |- gamer.js        # Patch/Update User's game information, Pick up/Use Game items, Earn Bobab points
 |   |- image.js        # Confirm Image upload
 |   |- mindcloud.js    # Import Mindcloud image
 |   |- story.js        # View the diary, Create/Update/Delete diary
 |   |- tutorial.js     # View the tutorials, Add/View/Delete favorites
 |   └─ user.js         # Sign up/Sign in with Local account/Kakao account
 |
 |- middleware        # Middleware running before controllers
 |   |- is-auth.js      # Authenticate using JWT
 |   |- update-gamer.js # Patch User's game information
 |   |- upload.js       # Upload the image to AWS S3 
 |   └─ validator.js    # Validation of input values when Signing up, Signing in, Authenticating email, Finding User's information
 |
 |- models            # Schema definitions for Mongoose models
 |   |- story.js        # Schema of Diaries
 |   |- tutorial.js     # Schema of Tutorials, Theme Songs, Comments 
 |   └─ user.js         # Schema of Users
 |
 |- pysrc             # Python file for making treemap
 |   └─ wordcloud.js    
 |
 |- routes            # Express route controllers for all the endpoints of the app
 |   |- auth.js 
 |   |- gamer.js
 |   |- image.js
 |   |- index.js
 |   |- mindcloud.js
 |   |- story.js
 |   |- tutorial.js
 |   └─ user.js
 |
 |- util              # Utils for user's token
 |   |- path.js         # filepath of entry module
 |   └─ token.js        # Create User's JWT
 |
 └─ views             # HTML file to render
     └─ index.html
```
## Dependencies
- [aws-sdk](https://github.com/aws/aws-sdk-js) - AWS-SDK to allow access to AWS S3
- [multer](https://github.com/expressjs/multer) - Middleware For Uploading Image file to AWS S3
- [multer-s3](https://github.com/badunk/multer-s3) - Streaming multer storage engine for AWS S3
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js/) - For Encrypting passwords
- [body-parser](https://github.com/expressjs/body-parser) - Middleware for Parsing incoming request bodies
- [dotenv](https://github.com/motdotla/dotenv) - For Loading environment variables from a .env file into process.env
- [ejs](https://github.com/mde/ejs) - For Rendering HTML string
- [express](https://github.com/expressjs/express) - The server for handling and routing HTTP requests
- [express-validator](https://github.com/express-validator/express-validator) - express.js Middleware for validator
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication
- [mongoose](https://github.com/Automattic/mongoose) - For modeling and mapping MongoDB data to javascript
- [nodemailer](https://github.com/nodemailer/nodemailer) - For Sending e-mails
- [nodemailer-mailgun-transport](https://github.com/orliesaurus/nodemailer-mailgun-transport) - Transport plugin that goes with nodemailer to send email
- [python-shell](https://github.com/extrabacon/python-shell) - For Running Python scripts

## Error Handling
1. ```middleware/is-auth``` : Define Error Handling Middleware for Handling Jsonwebtoken's Authentication Error - 401 status code
2. ```middleware/validator``` : Define Error Handling Middleware for Handling Mongoose's Validation Error - 422 status code
