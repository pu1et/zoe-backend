# Getting Started
To get the Node server running locally:
  - Clone this repo
  - ```npm install``` to install all required dependencies
  -  Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing ```mongod```
  -  ```npm run dev``` 
# Code Overview
## Project Structure
```
zoe-backend
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
- aws-sdk - For Uploading Image to AWS S3
- bcryptjs -
- body-parser - 
- dotenv - 
- ejs
- express
- express-validator - 
- fs - 
- https - 
- jsonwebtoken - 
- moment - 
- mongoose - 
- multer - 
- multer-s3
- nodemailer
- nodemailer-mailgun-transport
- nodemailer-sendgrid-transport
- nodemon
- passport - 
- passport-facebook - 
- passport-facebook-token - 
- passport-jwt
- passport-kakao
- passport-kakao-token - 
- passport-local - 
- python-shell - 
