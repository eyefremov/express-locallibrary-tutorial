# LocalLibrary Tutorial – Getting Started

This tutorial walks you through cloning, configuring, and running the LocalLibrary Express application from the repository [express-locallibrary-tutorial](https://github.com/eyefremov/express-locallibrary-tutorial).
It covers setup for Linux/Mac and Windows environments. Use the link above to avoid cloning the entire fullstack repository which has (hw1, hw2, and hw3). The repository above just has the contents of hw3.

---

## 1. Clone the Repository

Open a terminal (Linux/Mac) or Command Prompt/PowerShell (Windows) and run:

```bash
git clone https://github.com/eyefremov/express-locallibrary-tutorial
```
## 2. Install Node.js and npm (if needed)
You need Node v16 and npm installed.

- Windows:
Download from [Node.js official site](https://nodejs.org/en) or use [nvm-windows](https://github.com/coreybutler/nvm-windows).

- macOS/Linux:
Download from [Node.js official site](https://nodejs.org/en) or use [nvm](https://github.com/nvm-sh/nvm).

After installation, verify by running:
```bash
node --version
npm --version
```
Ensure Node is version 16.x. If using ***nvm***, you can run:
```bash
nvm install 16
nvm use 16
```
Otherwise, use ***npm*** by running:
```
npm install 16
npm use 16
```
## 3. Install Dependencies
Navigate to the project folder and install all required packages:
```bash
cd express-locallibrary-tutorial
npm install
```
This will install the dependencies defined in package.json into a local node_modules folder.

## 4. Create a Free MongoDB Atlas Database
You need a [MongoDB](https://www.mongodb.com/) database for the application. Follow these steps:

- [Sign up](https://www.mongodb.com/cloud/atlas/register) or [login](https://account.mongodb.com/account/login) to MongoDB Atlas.

There are three options for database creation. Select the free one.

### Important:
- On quick setup, ensure "Automate security setup" is checked and the "Preload sample dataset" is unchecked.
- Make sure you save the username and password that you will receive after the database is created. It will be required for the website database connection.
- If you didn't save it or lost it, you can reset it by clicking on the "Database Access" section under "Security", then clicking on the "edit" button on the user, then the "Edit Password"
    and finally "Autogenerate Secure Password".

### Obtain your connection URI:
- Click on your newly created database, if you didn't change the name then it should be called "Cluster0".
- Click on the "Connect" button and select the "Drivers" option.
- Copy the connection string under "3. Add your connection string into your application code".
- Finally, add the username and password from above into the connection string.
which should look similar to:
  ```bash
  mongodb+srv://username:password@cluster0.mongodb.net/myDatabaseName?retryWrites=true&w=majority
  ```
For more detailed instructions, see the MongoDB Atlas Getting Started Guide.

## 5. Create a .env File and Add Your URI
Inside the express-locallibrary-tutorial folder, create a file named .env and add your MongoDB connection URI:

```bash
MONGODB_URI="mongodb+srv://username:password@cluster0.mongodb.net/myDatabaseName?retryWrites=true&w=majority"
```
### Note:
- #### Do not commit the .env file to GitHub. Make sure your .gitignore includes .env so that it remains private.

## 6. (Optional) Populate the Database
If you want to populate the database with sample data, run the populatedb script from your project directory:

```bash
node populatedb "mongodb+srv://username:password@cluster0.mongodb.net/myDatabaseName?retryWrites=true&w=majority"
```
- Linux/Mac: The quotes around the URI are optional but recommended to avoid shell parsing issues.
- Windows: The quotes ensure that any special characters in the URI are handled properly.

## 7. Run the Application
### Set the NODE_ENV variable to production (temporarily):
- On macOS/linux:
  ```bash
  export NODE_ENV=production
  ```
- On Windows Powershell:
  ```bash
  $env:NODE_ENV = 'production'
  ```
There are two main ways to run the application:

### Development (Debug) Mode
This mode uses Nodemon to automatically restart the server on file changes:
```bash
npm run serverstart
```
This script sets the DEBUG environment variable to express-locallibrary-tutorial:* and runs Nodemon.

### Production Mode
Run the application without debug logs or auto-restart:
```
npm start
```

Once running, open your web browser and go to http://localhost:3000 to view the LocalLibrary home page.

## 8. Hosting or Sharing Your Project
To share or host your project:

### Create your repository or use the current one.
- Push all files except node_modules and .env (these should be ignored via .gitignore).
- Host your project on a platform such as Glitch, Heroku, or Railway. These services provide instructions for setting up Node.js applications and configuring environment variables.
Tip:
If reviewers need to clone and run your project locally, they can use this GitHub link:

  ```arduino
  https://github.com/eyefremov/express-locallibrary-tutorial
  ```

### Using Glitch as the web host:
- Go to [Glitch](https://glitch.com/signin) to sign in or signup.
- On the top right of the page, click "New Project" then "Import from GitHub".
- Paste your (or mine) repository link. Make sure that this is not a branch as my attempts to import from a branch failed (kept loading the project, but nothing happened).
- Once your project is loaded, if it does not pop up then click on the "Dashboard". From there you should see your project with a randomly generated name.
- Click on the project, and it should open a .env file. This file is created by Glitch and is not imported from GitHub.
- Add two environment variables:
  - MONGODB_URI with a value of:
  ```bash
    mongodb+srv://username:password@cluster0.mongodb.net/myDatabaseName?retryWrites=true&w=majority
    ```
  - NODE_ENV with a value of:
  ```bash
  production
  ```
  

## Congratulations!
You now have a fully functioning local copy of the LocalLibrary Express application. If you encounter any issues, check the following:

- The console/logs for error messages.
- That you are using the correct Node version (node --version should be 16.x).
- Your MongoDB connection string is correctly set in the .env file.
- All dependencies are installed (via npm install).

## If you run into issues:
- Document it for the pull request (So I can make this tutorial better).
