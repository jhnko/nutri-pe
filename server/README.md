### Setup server and db
- Setup a Postgresql database
- Run init.sql in database
- Optionally run seed_data.sql to fill database with example ingredient data
- Populate .env file with database parameters
- Run `npm install`
- Run `npm run build` to build files
- Run `npm run start` to start built server, could use `npm run dev` to just run directly without building for production

### Packages/Resources used to build backend
- used express for web server
- used bcrypt for crypto functions
- used jsonwebtoken for auth
- used cookieparser for reading and setting cookies (for auth)

For more information refer to the package.json file
